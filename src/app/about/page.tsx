import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Bloomport AI — Our Mission & Design Engine',
  description: 'Meet the team behind Bloomport AI, our mission to democratize web generation, and our open-source Tailwind CSS compiler philosophy.',
  alternates: {
    canonical: '/about',
  },
};

export default function Page() {
  return <AboutClient />;
}
