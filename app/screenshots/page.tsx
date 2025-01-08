'use client';

import { useState, useEffect } from 'react';
import { adminS3Service, Module } from '@/services/adminS3Service';
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload';
import { ModuleCard } from '@/components/screenshots/ModuleCard';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/common/icons';
import toast from 'react-hot-toast';

export default function ScreenshotsPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const data = await adminS3Service.fetchModules();
      setModules(data);
    } catch (error) {
      toast.error('Failed to fetch modules');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isAdmin && (
          <div className="mb-8">
            <ScreenshotUpload modules={modules} onSuccess={fetchModules} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules?.map((module) => (
            <ModuleCard
              key={module.id}
              name={module.name}
              moduleKey={module.key}
              screenshotsCount={module.screenshots?.length || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
