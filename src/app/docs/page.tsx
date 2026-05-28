import type { Metadata } from 'next';
import DocsClient from './DocsClient';

export const metadata: Metadata = {
  title: 'Bloomport AI Documentation — Integrations & Custom Web APIs',
  description: 'Learn how to connect to Bloomport\'s web generation engine, manage compute credits, and compile custom Tailwind CSS structures programmatically.',
};

export default function Page() {
  return <DocsClient />;
}
