import type { Metadata } from 'next';
import FocusTimerClient from './FocusTimerClient';

export const metadata: Metadata = {
  title: 'Free Online Focus Timer — Pomodoro AI Study Tool',
  description: 'Improve productivity and study focus with Bloomport\'s free Pomodoro focus timer. Combined with AI-guided mindfulness breaks.',
};

export default function Page() {
  return <FocusTimerClient />;
}
