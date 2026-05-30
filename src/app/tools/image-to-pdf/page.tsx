import type { Metadata } from 'next';
import ImageToPdfClient from './ImageToPdfClient';

export const metadata: Metadata = {
  title: 'Image to PDF Converter — Free Online Tool',
  description: 'Convert multiple JPG and PNG images into a single PDF document easily directly in your browser. Fast, secure, and free.',
  alternates: {
    canonical: '/tools/image-to-pdf',
  },
};

export default function Page() {
  return <ImageToPdfClient />;
}
