'use client';

import { useRouter } from 'next/navigation';
import { AdminListView } from '@/components/admin/AdminListView';
import { adminSections } from '@/data/adminSections';

interface AdminSectionPageProps {
  params: {
    type: string;
  };
}

export default function AdminSectionPage({ params }: AdminSectionPageProps) {
  const router = useRouter();
  const section = adminSections.find((s) => s.type === params.type);

  if (!section) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminListView
        type={params.type as any}
        title={section.title}
        onClose={() => router.push('/admin')}
      />
    </div>
  );
}
