'use client';

import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/navigation/Navigation';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = pathname === '/screenshots' || pathname === '/admin';

  return (
    <>
      {showNav && <Navigation />}
      {children}
      <Toaster position="top-right" />
    </>
  );
}
