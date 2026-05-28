import type { Metadata } from 'next';
import JournalPromptsClient from './JournalPromptsClient';

export const metadata: Metadata = {
  title: 'Free AI Journal Prompts Generator — Mental Clarity Tools',
  description: 'Generate personalized mindfulness journal prompts with conversational AI. Reclaim mental clarity and self-reflection for free.',
};

export default function Page() {
  return <JournalPromptsClient />;
}
