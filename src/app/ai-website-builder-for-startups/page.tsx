import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Free AI Website Builder for Startups — Prompt to Web',
  description: 'Generate beautiful startup and SaaS landing pages in seconds. Responsive Tailwind code, SEO-ready structure, and zero monthly paywalls.',
};

export default function Page() {
  return <HomeClient />;
}
