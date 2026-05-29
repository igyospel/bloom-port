import type { Metadata } from 'next';
import SignUpClient from './SignUpClient';

export const metadata: Metadata = {
  title: 'Create a Free Bloomport AI Account',
  description: 'Register for a free Bloomport AI account and instantly receive 10,000 compute credits to generate websites.',
  alternates: {
    canonical: '/signup',
  },
};

export default function Page() {
  return <SignUpClient />;
}
