'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  adminS3Service,
  Module,
  ScreenshotStatus,
} from '@/services/adminS3Service';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import toast from 'react-hot-toast';
import ScreenshotCard from '@/components/screenshots/ScreenshotCard';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SearchInput } from '@/components/common/SearchInput';
import { pageLabelService } from '@/services/pageLabelService';
import { PageLabel } from '@/types/pageLabel';
import { Dropdown } from '@/components/common/Dropdown';

export default function ModuleScreenshotsPage() {
  const params = useParams();
  const moduleKey = params.key as string;
  const [userRole, setUserRole] = useState<string>('user');
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [screenshotToDelete, setScreenshotToDelete] = useState<string | null>(
    null
  );
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filteredScreenshots, setFilteredScreenshots] = useState<
    Module['screenshots']
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableLabels, setAvailableLabels] = useState<PageLabel[]>([]);
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      try {
        const { role } = JSON.parse(auth);
        setUserRole(role);
      } catch (error) {
        // If JSON parsing fails, default to non-admin view
        setUserRole('user');
      }
    }
  }, []);

  const fetchLabels = useCallback(async () => {
    try {
      const labels = await pageLabelService.getAllLabels();
      setAvailableLabels(labels);

      // Create a map of label IDs to label names for quick lookup
      const labelMapping: Record<string, string> = {};
      labels.forEach((label) => {
        labelMapping[label.id] = label.name;
      });
      setLabelMap(labelMapping);
    } catch (error) {
      toast.error('Failed to fetch labels');
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

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

  // Apply filters whenever search term, selected label, or module changes
  useEffect(() => {
    if (!currentModule?.screenshots) return;

    let filtered = [...currentModule.screenshots];

    // Apply search filter
    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(/[\s-]+/);
      filtered = filtered.filter((screenshot) => {
        const normalizedName = screenshot.name.toLowerCase();
        return searchTerms.every((term) => normalizedName.includes(term));
      });
    }

    // Apply label filter
    if (selectedLabelId) {
      filtered = filtered.filter(
        (screenshot) => screenshot.labelId === selectedLabelId
      );
    }

    setFilteredScreenshots(filtered);
  }, [currentModule?.screenshots, searchTerm, selectedLabelId]);

  const handleDeleteScreenshot = async () => {
    if (!screenshotToDelete || !currentModule) return;

    setIsDeleting(true);
    try {
      await adminS3Service.deleteScreenshot(screenshotToDelete);
      await fetchModule();
      toast.success('Screenshot deleted successfully');
    } catch (error) {
      toast.error('Failed to delete screenshot');
    } finally {
      setIsDeleting(false);
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

  const handleNameChange = async (screenshotId: string, newName: string) => {
    try {
      await adminS3Service.updateScreenshotName(screenshotId, newName);
      await fetchModule();
      toast.success('Screenshot name updated successfully');
    } catch (error) {
      toast.error('Failed to update screenshot name');
    }
  };

  const handleLabelChange = async (
    screenshotId: string,
    newLabelId: string | null
  ) => {
    try {
      await adminS3Service.updateScreenshotLabel(screenshotId, newLabelId);
      await fetchModule();
      toast.success('Screenshot label updated successfully');
    } catch (error) {
      toast.error('Failed to update screenshot label');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !currentModule) return;

    const oldIndex = currentModule.screenshots.findIndex(
      (s) => s.id === active.id
    );
    const newIndex = currentModule.screenshots.findIndex(
      (s) => s.id === over.id
    );

    const newScreenshots = arrayMove(
      currentModule.screenshots,
      oldIndex,
      newIndex
    );
    const newOrder = newScreenshots.map((s) => s.id);

    // Optimistically update the UI
    setCurrentModule((prev) =>
      prev
        ? {
            ...prev,
            screenshots: newScreenshots,
            screenshotOrder: newOrder,
          }
        : null
    );

    try {
      await adminS3Service.updateScreenshotOrder(moduleKey, newOrder);
      toast.success('Screenshot order updated successfully');
    } catch (error) {
      toast.error('Failed to update screenshot order');
      // Revert on error
      await fetchModule();
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center" data-testid="loading">
          Loading...
        </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              {
                label: currentModule.name,
              },
            ]}
          />
          <div className="mt-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentModule.name}
            </h1>
            {userRole === 'admin' && currentModule.screenshots.length > 1 && (
              <button
                onClick={() => setIsDragModeEnabled(!isDragModeEnabled)}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${
                  isDragModeEnabled
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg
                  className={`mr-2 -ml-1 h-5 w-5 transition-transform ${
                    isDragModeEnabled ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                {isDragModeEnabled
                  ? 'Exit Reorder Mode'
                  : 'Reorder Screenshots'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentModule.screenshots.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No screenshots uploaded yet for this module.
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="w-full sm:w-auto sm:flex-1 mb-2 sm:mb-0">
                <SearchInput
                  onSearch={handleSearch}
                  placeholder="Search screenshots..."
                  delay={0}
                />
              </div>

              {availableLabels.length > 0 && (
                <Dropdown
                  options={availableLabels.map((label) => ({
                    id: label.id,
                    label: label.name,
                  }))}
                  selectedId={selectedLabelId}
                  onSelect={setSelectedLabelId}
                  allOptionLabel="All labels"
                  placeholder="Filter by label"
                />
              )}
            </div>

            {filteredScreenshots.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                No screenshots match your filters.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentModule.screenshots.map((s) => s.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredScreenshots.map((screenshot) => (
                      <ScreenshotCard
                        key={screenshot.id}
                        screenshot={screenshot}
                        userRole={userRole}
                        onStatusChange={handleStatusChange}
                        onDelete={setScreenshotToDelete}
                        onNameChange={handleNameChange}
                        onLabelChange={handleLabelChange}
                        isDragModeEnabled={isDragModeEnabled}
                        isDeleting={
                          isDeleting && screenshotToDelete === screenshot.id
                        }
                        searchTerm={searchTerm}
                        availableLabels={availableLabels}
                        labelName={
                          screenshot.labelId
                            ? labelMap[screenshot.labelId]
                            : null
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </>
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
