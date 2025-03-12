import React, { useRef } from 'react';
import { FiPlus, FiImage } from 'react-icons/fi';
import Switch from '@/components/shared/Switch';

interface ActionButtonsProps {
  userRole: string;
  isDraggable: boolean;
  setIsDraggable: (isDraggable: boolean) => void;
  onAddEventClick: () => void;
  onReplaceImageClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  userRole,
  isDraggable,
  setIsDraggable,
  onAddEventClick,
  onReplaceImageClick,
  fileInputRef,
  handleFileChange,
}) => {
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Add Event Button */}
      <button
        onClick={onAddEventClick}
        className="inline-flex items-center h-11 px-5 rounded-md bg-[#0073CF] text-white hover:bg-[#005ba3] transition-colors duration-200 shadow-sm"
      >
        <FiPlus className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Add Event</span>
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Replace Image Button */}
      <button
        onClick={onReplaceImageClick}
        className="inline-flex items-center h-11 px-5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
      >
        <FiImage className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Replace Image</span>
      </button>

      {/* Drag Switch */}
      <Switch isDraggable={isDraggable} setIsDraggable={setIsDraggable} />
    </div>
  );
};

export default ActionButtons;
