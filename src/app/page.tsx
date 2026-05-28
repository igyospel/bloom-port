import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Bloomport AI — Free AI Website Builder & Generator',
  description: 'Generate responsive websites and landing pages in 30 seconds with Bloomport AI. Export clean Tailwind CSS and HTML code. Free, no credit card required.',
};

export default function Page() {
  return <HomeClient />;
}
