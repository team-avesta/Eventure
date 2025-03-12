import { Screenshot, ScreenshotStatus } from '@/services/adminS3Service';
import Image from 'next/image';
import { useState } from 'react';
import EditScreenshotNameModal from './EditScreenshotNameModal';
import EditScreenshotLabelModal from './EditScreenshotLabelModal';
import EditScreenshotStatusModal from './EditScreenshotStatusModal';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HighlightedText } from '@/components/shared/HighlightedText';
import { PageLabel } from '@/types/pageLabel';
import { StatusChip } from '@/components/shared/StatusChip';
import { LabelChip } from '@/components/shared/LabelChip';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

interface ScreenshotCardProps {
  screenshot: Screenshot;
  userRole: string;
  onStatusChange: (screenshotId: string, status: ScreenshotStatus) => void;
  onDelete: (screenshotId: string) => void;
  onNameChange: (screenshotId: string, newName: string) => void;
  onLabelChange?: (screenshotId: string, newLabelId: string | null) => void;
  isDragModeEnabled: boolean;
  isDeleting: boolean;
  searchTerm?: string;
  availableLabels: PageLabel[];
  labelName: string | null;
}

export default function ScreenshotCard({
  screenshot,
  userRole,
  onStatusChange,
  onDelete,
  onNameChange,
  onLabelChange,
  isDragModeEnabled,
  isDeleting,
  searchTerm = '',
  availableLabels,
  labelName,
}: ScreenshotCardProps) {
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isEditLabelModalOpen, setIsEditLabelModalOpen] = useState(false);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: screenshot.id,
    disabled: userRole !== 'admin' || !isDragModeEnabled,
  });

  const handleLabelChange = (newLabelId: string | null) => {
    if (onLabelChange) {
      onLabelChange(screenshot.id, newLabelId);
    }
  };

  const handleStatusChange = (newStatus: ScreenshotStatus) => {
    onStatusChange(screenshot.id, newStatus);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: userRole === 'admin' && isDragModeEnabled ? 'grab' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative ${
        isDragModeEnabled && userRole === 'admin'
          ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg'
          : ''
      }`}
    >
      {isDragModeEnabled && (
        <div
          {...listeners}
          className="absolute inset-0 z-10 bg-transparent cursor-grab active:cursor-grabbing"
        />
      )}
      <a
        href={`/screenshots/${screenshot.id}`}
        className={`block ${isDragModeEnabled ? 'pointer-events-none' : ''}`}
      >
        <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="relative h-48">
            <Image
              src={screenshot.url}
              alt={screenshot.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <h3
                className="text-lg font-medium text-gray-900 truncate flex-1 group-hover:text-gray-700"
                title={screenshot.name}
              >
                <HighlightedText
                  text={screenshot.name}
                  highlight={searchTerm}
                  className="text-lg font-medium text-gray-900"
                />
              </h3>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {/* Status Chip */}
              <StatusChip
                status={screenshot.status || ScreenshotStatus.TODO}
                onClick={
                  userRole === 'admin'
                    ? () => setIsEditStatusModalOpen(true)
                    : undefined
                }
                isClickable={userRole === 'admin'}
              />

              {/* Label Chip */}
              {labelName && (
                <LabelChip
                  label={labelName}
                  onClick={
                    userRole === 'admin'
                      ? () => setIsEditLabelModalOpen(true)
                      : undefined
                  }
                  isClickable={userRole === 'admin'}
                />
              )}

              {/* Add Label Button */}
              {!labelName && userRole === 'admin' && (
                <LabelChip
                  label={null}
                  onClick={() => setIsEditLabelModalOpen(true)}
                  isClickable={true}
                  isAddButton={true}
                />
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Added {new Date(screenshot.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </a>
      {userRole === 'admin' && (
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsEditNameModalOpen(true);
            }}
            className="p-2 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700 pointer-events-auto"
            title="Edit name"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(screenshot.id)}
            aria-label={`Delete ${screenshot.name}`}
            data-testid={`delete-button-${screenshot.id}`}
            disabled={isDeleting}
            className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 pointer-events-auto"
            title="Delete screenshot"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <EditScreenshotNameModal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        onSave={(newName) => onNameChange(screenshot.id, newName)}
        currentName={screenshot.name}
      />

      <EditScreenshotLabelModal
        isOpen={isEditLabelModalOpen}
        onClose={() => setIsEditLabelModalOpen(false)}
        onSave={handleLabelChange}
        currentLabelId={screenshot.labelId || null}
        availableLabels={availableLabels}
      />

      <EditScreenshotStatusModal
        isOpen={isEditStatusModalOpen}
        onClose={() => setIsEditStatusModalOpen(false)}
        onSave={handleStatusChange}
        currentStatus={screenshot.status || ScreenshotStatus.TODO}
      />
    </div>
  );
}
