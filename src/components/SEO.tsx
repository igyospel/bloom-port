import { useEffect } from 'react';

const SITE_URL = 'https://bloomport.fun';

interface SEOProps {
  title: string;
  description: string;
  path?: string;       // e.g. '/api', '/docs' — defaults to '/'
  type?: string;       // og:type — defaults to 'website'
  image?: string;      // og:image path — defaults to '/bloomportBlack.png'
}

function setMetaTag(attr: string, key: string, content: string) {
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
}

export default function SEO({
  title,
  description,
  path = '/',
  type = 'website',
  image = '/bloomportBlack.png',
}: SEOProps) {
  useEffect(() => {
    const fullUrl = `${SITE_URL}${path === '/' ? '' : path}`;
    const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

    // ── Document Title ──
    document.title = title;

    // ── Base Meta ──
    setMetaTag('name', 'description', description);

    // ── Canonical ──
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = fullUrl;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = fullUrl;
      document.head.appendChild(canonical);
    }

    // ── Open Graph ──
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', fullImage);
    setMetaTag('property', 'og:site_name', 'Bloomport');

    // ── Twitter Cards ──
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', fullUrl);
    setMetaTag('name', 'twitter:image', fullImage);
  }, [title, description, path, type, image]);

  return null;
}
