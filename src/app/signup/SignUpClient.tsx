'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Dynamic load for browser compatibility during SSR
const SignUpPage = dynamic(() => import('@/components/ui/sign-up').then(m => m.SignUpPage), { ssr: false });

const sampleTestimonials = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: 'Sarah Chen',
    handle: 'Principal AI Engineer',
    text: "Bloomport's inference pipeline cut our agent latency by 60%. The memory architecture is production-grade.",
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Marcus Johnson',
    handle: 'Infrastructure Director',
    text: 'Multi-agent orchestration that actually scales. We run 2,000+ concurrent workflows without a single incident.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'David Kim',
    handle: 'VP of Product',
    text: 'The API is beautifully minimal. Shipped our first autonomous workflow in under a day.',
  },
];

export default function SignUpClient() {
  const router = useRouter();
  const { sendSignupOtp, verifySignupOtp, loginWithGoogle } = useAuth();

  const handleGoogleSignUp = async () => {
    const { error } = await loginWithGoogle();
    if (error) {
      alert(error.message || 'Google Sign-Up failed.');
    } else {
      router.push('/app');
    }
  };

  return (
    <SignUpPage
      testimonials={sampleTestimonials}
      onSendOtp={sendSignupOtp}
      onVerifyOtp={verifySignupOtp}
      onGoogleSignUp={handleGoogleSignUp}
      onSignIn={() => router.push('/signin')}
      onBack={() => router.push('/')}
      onSuccess={() => router.push('/app')}
    />
  );
}
