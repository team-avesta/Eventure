import React from 'react';
import { FiPlus, FiX, FiChevronRight } from 'react-icons/fi';

interface EventType {
  id: string;
  name: string;
  color: string;
}

interface EventTypeSelectorProps {
  isOpen: boolean;
  eventTypes: EventType[];
  onClose: () => void;
  onSelect: (type: EventType) => void;
  getEventTypeDescription: (typeId: string) => string;
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  isOpen,
  eventTypes,
  onClose,
  onSelect,
  getEventTypeDescription,
}) => {
  if (!isOpen) return null;

  // Render each event type option
  const renderEventTypeOptions = () => {
    return eventTypes.map((type) => (
      <button
        key={type.id}
        onClick={() => onSelect(type)}
        className="relative w-full rounded-lg border p-4 hover:border-blue-500 transition-all duration-200 group"
      >
        <div className="flex items-center">
          <div
            className="h-4 w-4 rounded-full mr-4"
            style={{ backgroundColor: type.color }}
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900 group-hover:text-blue-600">
              {type.name}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {getEventTypeDescription(type.id)}
            </p>
          </div>
          <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
        </div>
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <FiPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Add New Event
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Select the type of event you want to add to this screenshot.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">{renderEventTypeOptions()}</div>
        </div>
      </div>
    </div>
  );
};

export default EventTypeSelector;
