import { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';

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
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
