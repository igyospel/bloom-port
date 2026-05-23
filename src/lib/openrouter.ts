const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'deepseek/deepseek-v4-flash:free';

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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

export function isConfigured(): boolean {
  return !!API_KEY;
}

export async function* streamChatMessage(
  messages: Message[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Bloomport',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 2048,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `OpenRouter API error (${res.status}): ${res.statusText}${body ? ` — ${body}` : ''}`,
    );
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
