import React, { useMemo } from 'react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import ScreenshotCard from '@/components/screenshots/ScreenshotCard';
import { Module, ScreenshotStatus } from '@/services/adminS3Service';
import { PageLabel } from '@/types/pageLabel';
import { EmptyState } from '@/components/screenshots/module';

interface ScreenshotGridProps {
  screenshots: Module['screenshots'];
  userRole: string;
  onStatusChange: (
    screenshotId: string,
    newStatus: ScreenshotStatus
  ) => Promise<void>;
  onDelete: (screenshotId: string) => void;
  onNameChange: (screenshotId: string, newName: string) => Promise<void>;
  onLabelChange: (
    screenshotId: string,
    newLabelId: string | null
  ) => Promise<void>;
  isDragModeEnabled: boolean;
  isDeleting: boolean;
  screenshotToDelete: string | null;
  searchTerm: string;
  availableLabels: PageLabel[];
  labelMap: Record<string, string>;
  onDragEnd: (event: DragEndEvent) => Promise<void>;
}

/**
 * Grid component for displaying screenshots with drag and drop functionality
 */
const ScreenshotGrid: React.FC<ScreenshotGridProps> = ({
  screenshots,
  userRole,
  onStatusChange,
  onDelete,
  onNameChange,
  onLabelChange,
  isDragModeEnabled,
  isDeleting,
  screenshotToDelete,
  searchTerm,
  availableLabels,
  labelMap,
  onDragEnd,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check if there are no screenshots to display
  if (screenshots.length === 0) {
    return <EmptyState message="No screenshots match your filters." />;
  }

  const renderScreenshotCards = () => {
    return screenshots.map((screenshot) => (
      <ScreenshotCard
        key={screenshot.id}
        screenshot={screenshot}
        userRole={userRole}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onNameChange={onNameChange}
        onLabelChange={onLabelChange}
        isDragModeEnabled={isDragModeEnabled}
        isDeleting={isDeleting && screenshotToDelete === screenshot.id}
        searchTerm={searchTerm}
        availableLabels={availableLabels}
        labelName={screenshot.labelId ? labelMap[screenshot.labelId] : null}
      />
    ));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={screenshots.map((s) => s.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="screenshot-grid"
        >
          {renderScreenshotCards()}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ScreenshotGrid;
