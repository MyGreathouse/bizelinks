import type { PublicPage } from '@/lib/public-page'

/**
 * The example page at /example. Same shape as a real page, rendered by the same
 * components, so it shows exactly what a published BizeLinks page looks like.
 * Destinations point at example.com — this is demonstration content.
 */
export const DEMO_PAGE: PublicPage = {
  username: 'example',
  display_name: 'Elias Okafor',
  descriptor: 'Business strategist, author and creator',
  bio: 'I help founders make clearer decisions. Books, practical tools and weekly videos on building a business that lasts.',
  location: 'Leicester, United Kingdom',
  avatar_path: null,
  entity_type: 'person',
  is_indexable: false,
  theme: 'paper',
  accent: '#C8421A',
  updated_at: '2026-10-02T09:00:00Z',
  socials: [
    { provider: 'youtube', url: 'https://example.com/youtube' },
    { provider: 'instagram', url: 'https://example.com/instagram' },
    { provider: 'linkedin', url: 'https://example.com/linkedin' },
    { provider: 'facebook', url: 'https://example.com/facebook' },
    { provider: 'email', url: 'mailto:hello@example.com' },
  ],
  items: [
    {
      id: 'demo-s1', zone: 'spotlight', kind: 'product', badge: 'new',
      title: 'The Proverbs Code',
      description: 'Practical wisdom for everyday decisions. Out now in paperback and ebook.',
      url: 'https://example.com/proverbs-code', image_path: null, cta_label: 'Get the book', price_label: null,
    },
    {
      id: 'demo-s2', zone: 'spotlight', kind: 'booking', badge: null,
      title: 'Work with me',
      description: 'One-to-one strategy sessions for founders and small teams.',
      url: 'https://example.com/consult', image_path: null, cta_label: 'Book a call', price_label: null,
    },
    {
      id: 'demo-s3', zone: 'spotlight', kind: 'content', badge: null,
      title: 'Latest video: pricing your first offer',
      description: '',
      url: 'https://example.com/latest-video', image_path: null, cta_label: 'Watch now', price_label: null,
    },
    {
      id: 'demo-p1', zone: 'products', kind: 'product', badge: 'popular',
      title: 'Founder Pricing Workbook',
      description: 'Work out what to charge, step by step, in one afternoon.',
      url: 'https://example.com/pricing-workbook', image_path: null, cta_label: 'Buy now', price_label: '£9.99',
    },
    {
      id: 'demo-p2', zone: 'products', kind: 'product', badge: null,
      title: 'Business Strategy Toolkit',
      description: 'Twelve templates for planning, pricing and reviewing your quarter.',
      url: 'https://example.com/toolkit', image_path: null, cta_label: 'Download', price_label: '£24',
    },
    {
      id: 'demo-l1', zone: 'links', kind: 'link', badge: null, title: 'My website',
      description: '', url: 'https://example.com', image_path: null, cta_label: null, price_label: null,
    },
    {
      id: 'demo-l2', zone: 'links', kind: 'newsletter', badge: null, title: 'The Sunday strategy letter',
      description: '', url: 'https://example.com/newsletter', image_path: null, cta_label: null, price_label: null,
    },
    {
      id: 'demo-l3', zone: 'links', kind: 'content', badge: null, title: 'Podcast interviews',
      description: '', url: 'https://example.com/podcast', image_path: null, cta_label: null, price_label: null,
    },
    {
      id: 'demo-l4', zone: 'links', kind: 'service', badge: null, title: 'Speaking enquiries',
      description: '', url: 'https://example.com/speaking', image_path: null, cta_label: null, price_label: null,
    },
  ],
}
