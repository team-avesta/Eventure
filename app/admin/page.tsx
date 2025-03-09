'use client';

import { useRouter } from 'next/navigation';
import { AdminCard } from '@/components/admin/AdminCard';
import { adminSections } from '@/data/adminSections';
import { useAdminState } from '@/hooks/useAdminState';
import { CgSpinner } from 'react-icons/cg';

export default function AdminPage() {
  const router = useRouter();
  const { isLoading } = useAdminState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CgSpinner size={32} className="animate-spin" role="progressbar" />
      </div>
    );
  }

  const renderHeader = () => (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-4 text-lg text-gray-500">
        Manage event types, categories, dimensions, and more
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderHeader()}
        <div className="mt-12 max-w-lg mx-auto grid gap-6 lg:grid-cols-3 lg:max-w-none">
          {adminSections.map((section) => (
            <AdminCard
              key={section.type}
              {...section}
              onClick={() => router.push(`/admin/${section.type}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
