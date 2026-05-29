import type { Metadata } from 'next';
import AppClient from './AppClient';

export const metadata: Metadata = {
  title: 'Bloomport Chat — Free AI Models & Free LLM Chat Online',
  description: 'Run mindful conversational chat using multiple free AI models. Zero-cost AI journaling, deep work timers, and focus sessions with no credits required to start.',
  alternates: {
    canonical: '/app',
  },
};

export default function Page() {
  return <AppClient />;
}
