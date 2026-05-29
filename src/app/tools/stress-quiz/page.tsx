import type { Metadata } from 'next';
import StressQuizClient from './StressQuizClient';

export const metadata: Metadata = {
  title: 'Free AI Stress & Cognitive Load Quiz',
  description: 'Identify current stress levels and cognitive load triggers. Get customized guidance on mindfulness exercises in 2 minutes.',
  alternates: {
    canonical: '/tools/stress-quiz',
  },
};

export default function Page() {
  return <StressQuizClient />;
}
