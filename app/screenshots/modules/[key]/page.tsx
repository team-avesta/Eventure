'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import toast from 'react-hot-toast';
import {
  EmptyState,
  ModuleHeader,
  ScreenshotFilters,
  ScreenshotGrid,
} from '@/components/screenshots/module';
import { useLabelData } from '@/hooks/useLabelData';
import { useModuleData } from '@/hooks/useModuleData';
import { useScreenshotManagement } from '@/hooks/useScreenshotManagement';
import { useScreenshotFiltering } from '@/hooks/useScreenshotFiltering';

export default function ModuleScreenshotsPage() {
  const params = useParams();
  const moduleKey = params.key as string;
  const [userRole, setUserRole] = useState<string>('user');

  // Use the useLabelData hook to manage labels
  const {
    labels: availableLabels,
    labelMap,
    isLoading: isLabelsLoading,
    error: labelsError,
  } = useLabelData();

  // Use the useModuleData hook to manage module data
  const {
    currentModule,
    isLoading: isModuleLoading,
    error: moduleError,
    fetchModule,
    setCurrentModule,
  } = useModuleData(moduleKey);

  // Use the useScreenshotManagement hook to manage screenshot operations
  const {
    screenshotToDelete,
    setScreenshotToDelete,
    isDeleting,
    isDragModeEnabled,
    setIsDragModeEnabled,
    handleDeleteScreenshot,
    handleStatusChange,
    handleNameChange,
    handleLabelChange,
    handleDragEnd,
  } = useScreenshotManagement(moduleKey, currentModule, fetchModule);

  // Use the useScreenshotFiltering hook to manage filtering
  const {
    filteredScreenshots,
    searchTerm,
    selectedLabelId,
    handleSearch,
    setSelectedLabelId,
  } = useScreenshotFiltering(currentModule?.screenshots);

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

  if (isModuleLoading || isLabelsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center" data-testid="loading">
          Loading...
        </div>
      </div>
    );
  }

  if (labelsError) {
    toast.error('Failed to load labels');
  }

  if (moduleError || !currentModule) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Module not found</div>
      </div>
    );
  }

  const renderContent = () => {
    // If no screenshots in the module
    if (currentModule.screenshots.length === 0) {
      return (
        <EmptyState message="No screenshots uploaded yet for this module." />
      );
    }

    // If screenshots exist but none match the current filters
    if (filteredScreenshots.length === 0) {
      return (
        <>
          <ScreenshotFilters
            onSearch={handleSearch}
            labels={availableLabels}
            selectedLabelId={selectedLabelId}
            onLabelSelect={setSelectedLabelId}
          />
          <EmptyState message="No screenshots match your filters." />
        </>
      );
    }

    // Normal case: show filters and screenshot grid
    return (
      <>
        <ScreenshotFilters
          onSearch={handleSearch}
          labels={availableLabels}
          selectedLabelId={selectedLabelId}
          onLabelSelect={setSelectedLabelId}
        />
        <ScreenshotGrid
          screenshots={filteredScreenshots}
          userRole={userRole}
          onStatusChange={handleStatusChange}
          onDelete={setScreenshotToDelete}
          onNameChange={handleNameChange}
          onLabelChange={handleLabelChange}
          isDragModeEnabled={isDragModeEnabled}
          isDeleting={isDeleting}
          screenshotToDelete={screenshotToDelete}
          searchTerm={searchTerm}
          availableLabels={availableLabels}
          labelMap={labelMap}
          onDragEnd={handleDragEnd}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleHeader
        moduleName={currentModule.name}
        isAdmin={userRole === 'admin'}
        hasMultipleScreenshots={currentModule.screenshots.length > 1}
        isDragModeEnabled={isDragModeEnabled}
        onToggleDragMode={() => setIsDragModeEnabled(!isDragModeEnabled)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
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
