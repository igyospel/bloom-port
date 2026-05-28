import type { Metadata } from 'next';
import SignInClient from './SignInClient';

export const metadata: Metadata = {
  title: 'Sign In to Bloomport AI Console',
  description: 'Access your Bloomport AI dashboard, keys, and workspace tools to generate responsive landing pages.',
};

export default function Page() {
  return <SignInClient />;
}
