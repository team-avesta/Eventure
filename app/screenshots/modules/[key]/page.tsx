'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  adminS3Service,
  Module,
  ScreenshotStatus,
} from '@/services/adminS3Service';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import toast from 'react-hot-toast';
import ScreenshotCard from '@/components/screenshots/ScreenshotCard';

export default function ModuleScreenshotsPage() {
  const params = useParams();
  const moduleKey = params.key as string;
  const [userRole, setUserRole] = useState<string>('');
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [screenshotToDelete, setScreenshotToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      const { role } = JSON.parse(auth);
      setUserRole(role);
    }
  }, []);

  const fetchModule = useCallback(async () => {
    try {
      const modules = await adminS3Service.fetchModules();
      const foundModule = modules.find((m) => m.key === moduleKey);
      setCurrentModule(foundModule || null);
    } catch (error) {
      toast.error('Failed to fetch module');
    } finally {
      setIsLoading(false);
    }
  }, [moduleKey]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  const handleDeleteScreenshot = async () => {
    if (!screenshotToDelete || !currentModule) return;

    try {
      await adminS3Service.deleteScreenshot(screenshotToDelete);
      await fetchModule();
      toast.success('Screenshot deleted successfully');
    } catch (error) {
      toast.error('Failed to delete screenshot');
    } finally {
      setScreenshotToDelete(null);
    }
  };

  const handleStatusChange = async (
    screenshotId: string,
    newStatus: ScreenshotStatus
  ) => {
    try {
      await adminS3Service.updateScreenshotStatus(screenshotId, newStatus);
      await fetchModule();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Module not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/screenshots"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Modules
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {currentModule.name}
          </h1>
        </div>

        {currentModule.screenshots.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No screenshots uploaded yet for this module.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentModule.screenshots.map((screenshot) => (
              <ScreenshotCard
                key={screenshot.id}
                screenshot={screenshot}
                userRole={userRole}
                onStatusChange={handleStatusChange}
                onDelete={setScreenshotToDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!screenshotToDelete}
        onClose={() => setScreenshotToDelete(null)}
        onConfirm={handleDeleteScreenshot}
        title="Delete Screenshot"
        message="Are you sure you want to delete this screenshot? This action cannot be undone."
      />
    </div>
  );
}
