import type { Metadata } from 'next';
import { Host_Grotesk, Hanken_Grotesk } from 'next/font/google';
import Script from 'next/script';
import '@/index.css';
import Providers from './providers';

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Bloomport AI | Free AI Chatbot & Intelligent Assistant',
  description: 'Chat instantly with Bloomport AI, your free intelligent conversational assistant. No login required, start chatting now.',
  keywords: [
    'free ai chatbot',
    'ai assistant',
    'chatgpt alternative',
    'conversational ai',
    'free chat ai',
    'bloomport ai',
    'smart virtual assistant',
    'ai prompt chat'
  ],
  metadataBase: new URL('https://bloomport.fun'),
  openGraph: {
    type: 'website',
    url: 'https://bloomport.fun',
    title: 'Bloomport AI | Free AI Chatbot & Intelligent Assistant',
    description: 'Chat instantly with Bloomport AI, your free intelligent conversational assistant. No login required, start chatting now.',
    images: [
      {
        url: '/bloomportBlack.png',
      }
    ],
    siteName: 'Bloomport AI',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloomport AI | Free AI Chatbot & Intelligent Assistant',
    description: 'Chat instantly with Bloomport AI, your free intelligent conversational assistant. No login required, start chatting now.',
    images: ['/bloomportBlack.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'monetag': '222cf21abe3227c06e8a970cb1a8649a',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bloomport AI",
    "url": "https://bloomport.fun",
    "logo": "https://bloomport.fun/bloomportBlack.png",
    "description": "Bloomport AI is a free AI chatbot and intelligent virtual assistant. Chat instantly and solve problems with AI.",
    "sameAs": [
      "https://twitter.com/bloomport",
      "https://github.com/igyospel/bloom-port"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bloomport AI",
    "url": "https://bloomport.fun",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bloomport.fun/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Dr. Sarah Carter",
    "jobTitle": "Lead AI Engineer",
    "worksFor": {
      "@type": "Organization",
      "name": "Bloomport AI"
    },
    "description": "Expert in natural language processing and advanced neural conversational models, leading the AI engine at Bloomport AI."
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Bloomport AI Labs",
    "image": "https://bloomport.fun/bloomportBlack.png",
    "url": "https://bloomport.fun",
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Virtual Design Lab",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94103",
      "addressCountry": "US"
    },
    "priceRange": "$0"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Conversational AI Website Generation & Deployment",
    "provider": {
      "@type": "Organization",
      "name": "Bloomport AI"
    },
    "areaServed": "Worldwide",
    "description": "Converts natural language specifications into functional, responsive web pages and landing pages with pre-packaged SEO metadata and clean layout grids."
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Bloomport AI Web Generator",
    "url": "https://bloomport.fun",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web",
    "description": "A free AI-powered website builder that generates complete responsive landing pages and layouts from text inputs.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free starter tier with 10,000 credit allowances"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "3100",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Instant website generator",
      "Free landing page creator",
      "Clean Tailwind CSS layout downloads",
      "No-code interface editor",
      "Built-in structured schemas",
      "API keys gateway"
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Bloomport AI Generation Credits",
    "image": "https://bloomport.fun/bloomportBlack.png",
    "description": "Compute key allowances for generating responsive pages programmatically via our API gateways.",
    "brand": {
      "@type": "Brand",
      "name": "Bloomport AI"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "url": "https://bloomport.fun"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Bloomport AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bloomport AI is a free AI-powered website builder and generator that converts natural language text prompts into functional, responsive web pages and landing pages in under 30 seconds."
        }
      },
      {
        "@type": "Question",
        "name": "Is this AI website generator free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Bloomport AI is completely free to use. New registrations instantly receive 10,000 compute credits, which covers the generation and deployment of multiple fully responsive landing pages."
        }
      },
      {
        "@type": "Question",
        "name": "Can I export the code generated by the AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Bloomport AI features a 'Zero Lock-In' policy, meaning you can immediately export and download the complete compiled HTML5 code and Tailwind CSS styling sheet to host anywhere."
        }
      },
      {
        "@type": "Question",
        "name": "How is Bloomport AI different from Wix or Framer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike Wix or Framer which charge expensive monthly subscriptions ($15–$30/month) and lock custom hosting/code downloads, Bloomport AI offers free Tailwind CSS layout exports, high-performance speeds, and open developer API access with zero cost."
        }
      },
      {
        "@type": "Question",
        "name": "Does Bloomport AI support SEO optimization?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Every website generated by Bloomport AI is built with clean, semantic HTML5, responsive viewports, custom heading hierarchy, and automatic schema markups ready to index on Google and Bing."
        }
      }
    ]
  };

  return (
    <html lang="en" className={`${hostGrotesk.variable} ${hankenGrotesk.variable}`} style={{ backgroundColor: '#000000' }}>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="llms" href="/llms.txt" />
        <link rel="preload" as="image" href="/_next/image?url=%2FlandingAnimated-poster.jpg&amp;w=1920&amp;q=75" />

        {/* Structured Schema Injections */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        {/* Monetag */}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="244037"
          data-cfasync="false"
          async
          strategy="afterInteractive"
        />

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8100210912904825"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <Script id="adsense-init" strategy="lazyOnload">
          {`
            window.adsbygoogle = window.adsbygoogle || [];
            window.adConfig = window.adConfig || function(o) { (window.adsbygoogle = window.adsbygoogle || []).push(o); };
            window.adBreak  = window.adBreak  || function(o) { (window.adsbygoogle = window.adsbygoogle || []).push(o); };
            window.adConfig({
              preloadAdBreaks: 'on',
              sound: 'on',
            });
          `}
        </Script>

        {/* Monetag Script Registration */}
        <Script id="monetag-init" strategy="lazyOnload">
          {`
            window.monetagShowAd = function() {
              return new Promise(function(resolve) {
                if (typeof window.show === 'function') {
                  window.show(11052024, { autoReload: false })
                    .then(function(result) { resolve(result); })
                    .catch(function()    { resolve('error'); });
                } else {
                  resolve('unavailable');
                }
              });
            };
          `}
        </Script>
      </head>
      <body className="antialiased bg-black text-white font-sans selection:bg-white selection:text-black" style={{ backgroundColor: '#000000' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
