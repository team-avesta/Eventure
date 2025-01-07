'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getModules } from '@/services/modules';
import { deleteScreenshot } from '@/services/screenshots';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ConfirmationModal from '@/components/shared/ConfirmationModal';

export default function ModuleScreenshotsPage() {
  const params = useParams();
  const moduleKey = params.key as string;
  const [userRole, setUserRole] = useState<string>('');
  const queryClient = useQueryClient();
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

  const { data: modules } = useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScreenshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });

  const currentModule = modules?.find((m) => m.key === moduleKey);

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
              <div key={screenshot.id} className="relative group">
                <Link href={`/screenshots/${screenshot.id}`} className="block">
                  <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="relative h-48">
                      <Image
                        src={screenshot.url}
                        alt={screenshot.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {screenshot.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Added{' '}
                        {new Date(screenshot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setScreenshotToDelete(screenshot.id)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                    title="Delete screenshot"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!screenshotToDelete}
        onClose={() => setScreenshotToDelete(null)}
        onConfirm={() => {
          if (screenshotToDelete) {
            deleteMutation.mutate(screenshotToDelete);
          }
        }}
        title="Delete Screenshot"
        message="Are you sure you want to delete this screenshot? This action cannot be undone."
      />
    </div>
  );
}
