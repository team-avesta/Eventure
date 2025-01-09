import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Eventure - Event Mapping Made Simple',
  description:
    'A powerful event mapping tool that helps you visualize, track, and manage events on your webapp with real-time tracking and analytics.',
  keywords:
    'event mapping, analytics, user tracking, event visualization, webapp analytics',
  authors: [{ name: 'Team Avesta' }],
  creator: 'Team Avesta',
  publisher: 'Team Avesta',
  robots: 'noindex, nofollow',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    type: 'website',
    title: 'Eventure - Event Mapping Made Simple',
    description:
      'A powerful event mapping tool that helps you visualize, track, and manage events on your webapp.',
    siteName: 'Eventure',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};
