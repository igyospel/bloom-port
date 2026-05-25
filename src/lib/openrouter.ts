interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface StreamChunk {
  id: string;
  choices: {
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

let apiConfigured = true;

// Query the backend configuration check asynchronously on load
fetch('/api/config')
  .then((res) => res.json())
  .then((data) => {
    apiConfigured = !!data.configured;
  })
  .catch(() => {
    apiConfigured = false;
  });

export function isConfigured(): boolean {
  return apiConfigured;
}

export async function* streamChatMessage(
  messages: Message[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  },
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: options?.model,
      temperature: options?.temperature,
      max_tokens: options?.max_tokens,
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const errMsg = body?.error || `Server error (${res.status}): ${res.statusText}`;
    throw new Error(errMsg);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body stream available');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.slice(6);
        if (jsonStr === '[DONE]') return;

        try {
          const chunk: StreamChunk = JSON.parse(jsonStr);
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
