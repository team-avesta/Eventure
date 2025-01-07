'use client';

import { useQuery } from '@tanstack/react-query';
import { getModules } from '@/services/modules';
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload';
import { ModuleCard } from '@/components/screenshots/ModuleCard';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/common/icons';

export default function ScreenshotsPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();

  const { data: modules, isLoading: isModulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
  });

  if (isAuthLoading || isModulesLoading) {
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
            <ScreenshotUpload />
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
