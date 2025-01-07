'use client';

import { Spinner } from '@/components/common/icons';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminModals } from '@/components/admin/AdminModals';
import { adminSections } from '@/data/adminSections';
import { useAdminState } from '@/hooks/useAdminState';

export default function AdminPage() {
  const {
    isLoading,
    isSubmitting,
    modalState,
    openModal,
    closeModal,
    handleSubmit,
  } = useAdminState();

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
              onAdd={() => openModal(section.type)}
              onManage={() => openModal(section.type, true)}
            />
          ))}
        </div>
      </div>
      <AdminModals
        modalState={modalState}
        isSubmitting={isSubmitting}
        closeModal={closeModal}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
