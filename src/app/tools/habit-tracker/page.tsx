import type { Metadata } from 'next';
import HabitTrackerClient from './HabitTrackerClient';

export const metadata: Metadata = {
  title: 'Free Daily Habit Tracker Checklist Online',
  description: 'Build and track mindful daily habits with Bloomport\'s checklist. Sync streaks with Supabase for free.',
};

export default function Page() {
  return <HabitTrackerClient />;
}
