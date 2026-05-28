import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Bloomport Blog — Mindfulness, Focus & Free AI Guides',
  description: 'Explore articles on mindful productivity, how to stop overthinking, free AI tools for mental health, and focus techniques. Written for calm, intentional living.',
};

export default function Page() {
  return <BlogClient />;
}
