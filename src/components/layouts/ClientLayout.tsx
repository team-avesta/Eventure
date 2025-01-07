'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/navigation/Navigation';
import { usePathname } from 'next/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = pathname === '/screenshots' || pathname === '/admin';

  return (
    <QueryClientProvider client={queryClient}>
      {showNav && <Navigation />}
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
