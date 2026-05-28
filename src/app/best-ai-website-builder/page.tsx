import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Best AI Website Builder in 2026 — Wix & Framer Competitor',
  description: 'Discover why Bloomport AI is rated the best free AI website generator. Export clean compiled HTML/CSS with zero monthly subscriptions or paywalls.',
};

export default function Page() {
  return <HomeClient />;
}
