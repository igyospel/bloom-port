import type { Metadata } from 'next';
import ApiClient from './ApiClient';

export const metadata: Metadata = {
  title: 'Bloomport API Console — Multi-Model AI Router API',
  description: 'Get developer API keys to integrate free and premium AI models. Access high-speed, zero-latency inference gateways with allowance credits.',
  alternates: {
    canonical: '/api-gateway',
  },
};

export default function Page() {
  return <ApiClient />;
}
