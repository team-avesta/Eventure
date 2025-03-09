import React, { useRef, useEffect } from 'react';
import { FiInfo, FiEdit, FiTrash2 } from 'react-icons/fi';
import type { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';

interface ActionDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: Rectangle) => void;
  onDelete?: (event: Rectangle) => void;
  onViewDescription?: (id: string, description: string) => void;
  event: {
    id: string;
    startX: number;
    startY: number;
    width: number;
    height: number;
    eventType: string;
    eventAction?: string;
    description?: string;
  };
  isAdmin: boolean;
}

export default function ActionDropdown({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onViewDescription,
  event,
  isAdmin,
}: ActionDropdownProps) {
  if (!isOpen) return null;

  const handleClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  return (
    <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1" role="menu">
        {event.description && (
          <button
            onClick={(e) =>
              handleClick(e, () => {
                onViewDescription?.(event.id, event.description || '');
                onClose();
              })
            }
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100"
            role="menuitem"
          >
            <FiInfo className="w-4 h-4 text-blue-600" />
            View Description
          </button>
        )}
        {isAdmin && (
          <>
            <button
              onClick={(e) =>
                handleClick(e, () => {
                  onEdit?.({
                    id: event.id,
                    startX: event.startX,
                    startY: event.startY,
                    width: event.width,
                    height: event.height,
                    eventType: event.eventType,
                    eventAction: event.eventAction || '',
                  });
                  onClose();
                })
              }
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              role="menuitem"
            >
              <FiEdit className="w-4 h-4" />
              Edit Details
            </button>
            <button
              onClick={(e) =>
                handleClick(e, () => {
                  onDelete?.({
                    id: event.id,
                    startX: event.startX,
                    startY: event.startY,
                    width: event.width,
                    height: event.height,
                    eventType: event.eventType,
                    eventAction: event.eventAction || '',
                  });
                  onClose();
                })
              }
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              role="menuitem"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
