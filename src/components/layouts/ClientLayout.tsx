'use client';

import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/navigation/Navigation';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AnalyticsModal } from '@/components/screenshots/AnalyticsModal';
import { adminS3Service } from '@/services/adminS3Service';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = pathname === '/screenshots' || pathname === '/admin';
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [modules, setModules] = useState([]);

  const handleShowAnalytics = async () => {
    try {
      const data = await adminS3Service.fetchModules();
      const modulesWithEvents: any =
        await adminS3Service.fetchModuleEventCounts(data);
      setModules(modulesWithEvents);
      setShowAnalytics(true);
    } catch (error) {
      console.error('Failed to fetch modules for analytics');
    }
  };

  return (
    <>
      {showNav && <Navigation onShowAnalytics={handleShowAnalytics} />}
      {children}
      <Toaster position="top-center" />
      <AnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        modules={modules}
      />
    </>
  );
}
