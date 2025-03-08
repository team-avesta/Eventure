import { useState, useCallback } from 'react';
import {
  adminS3Service,
  Module,
  ScreenshotStatus,
} from '@/services/adminS3Service';
import toast from 'react-hot-toast';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface UseScreenshotManagementReturn {
  screenshotToDelete: string | null;
  setScreenshotToDelete: React.Dispatch<React.SetStateAction<string | null>>;
  isDeleting: boolean;
  isDragModeEnabled: boolean;
  setIsDragModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteScreenshot: () => Promise<void>;
  handleStatusChange: (
    screenshotId: string,
    newStatus: ScreenshotStatus
  ) => Promise<void>;
  handleNameChange: (screenshotId: string, newName: string) => Promise<void>;
  handleLabelChange: (
    screenshotId: string,
    newLabelId: string | null
  ) => Promise<void>;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

/**
 * Custom hook to manage screenshot operations
 * @param moduleKey - The key of the module containing the screenshots
 * @param module - The module containing the screenshots
 * @param refreshModule - Function to refresh the module data
 * @returns Screenshot management functions and state
 */
export function useScreenshotManagement(
  moduleKey: string,
  module: Module | null,
  refreshModule: () => Promise<void>
): UseScreenshotManagementReturn {
  const [screenshotToDelete, setScreenshotToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);

  const handleDeleteScreenshot = useCallback(async () => {
    if (!screenshotToDelete) return;

    setIsDeleting(true);
    try {
      await adminS3Service.deleteScreenshot(screenshotToDelete);
      await refreshModule();
      toast.success('Screenshot deleted successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete screenshot';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setScreenshotToDelete(null);
    }
  }, [screenshotToDelete, refreshModule]);

  const handleStatusChange = useCallback(
    async (screenshotId: string, newStatus: ScreenshotStatus) => {
      try {
        await adminS3Service.updateScreenshotStatus(screenshotId, newStatus);
        await refreshModule();
        toast.success('Status updated successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update status';
        toast.error(errorMessage);
      }
    },
    [refreshModule]
  );

  const handleNameChange = useCallback(
    async (screenshotId: string, newName: string) => {
      try {
        await adminS3Service.updateScreenshotName(screenshotId, newName);
        await refreshModule();
        toast.success('Screenshot name updated successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update screenshot name';
        toast.error(errorMessage);
      }
    },
    [refreshModule]
  );

  const handleLabelChange = useCallback(
    async (screenshotId: string, newLabelId: string | null) => {
      try {
        await adminS3Service.updateScreenshotLabel(screenshotId, newLabelId);
        await refreshModule();
        toast.success('Screenshot label updated successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update screenshot label';
        toast.error(errorMessage);
      }
    },
    [refreshModule]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !module) return;

      const oldIndex = module.screenshots.findIndex((s) => s.id === active.id);
      const newIndex = module.screenshots.findIndex((s) => s.id === over.id);

      const newScreenshots = arrayMove(module.screenshots, oldIndex, newIndex);
      const newOrder = newScreenshots.map((s) => s.id);

      try {
        await adminS3Service.updateScreenshotOrder(moduleKey, newOrder);
        await refreshModule();
        toast.success('Screenshot order updated successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update screenshot order';
        toast.error(errorMessage);
        // Revert on error by refreshing the module
        await refreshModule();
      }
    },
    [module, moduleKey, refreshModule]
  );

  return {
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
  };
}
