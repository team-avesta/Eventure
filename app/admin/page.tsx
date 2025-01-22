'use client';

import { useState } from 'react';
import { Spinner } from '@/components/common/icons';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminListView } from '@/components/admin/AdminListView';
import { adminSections } from '@/data/adminSections';
import { useAdminState } from '@/hooks/useAdminState';

export default function AdminPage() {
  const { isLoading } = useAdminState();
  const [selectedSection, setSelectedSection] = useState<{
    type: string;
    title: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size={32} />
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
              onClick={() =>
                setSelectedSection({
                  type: section.type,
                  title: section.title,
                })
              }
            />
          ))}
        </div>
      </div>

      {selectedSection && (
        <AdminListView
          type={selectedSection.type as any}
          title={selectedSection.title}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </div>
  );
}
