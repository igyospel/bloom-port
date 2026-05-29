import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Free AI Landing Page Generator — Create in 30 Seconds',
  description: 'Build high-converting startup landing pages instantly with the Bloomport AI landing page generator. Free code download & Tailwind styles.',
  alternates: {
    canonical: '/free-ai-landing-page-generator',
  },
};

export default function Page() {
  return <HomeClient />;
}
