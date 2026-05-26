export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readingTimeMinutes: number;
  primaryKeyword: string;
  tags: string[];
  faq: Array<{ question: string; answer: string }>;
  schema?: object;
}
