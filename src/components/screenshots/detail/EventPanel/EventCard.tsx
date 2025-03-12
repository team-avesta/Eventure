import React from 'react';
import { FiMoreVertical, FiInfo } from 'react-icons/fi';
import ActionDropdown from '@/components/shared/ActionDropdown';
import DimensionDisplay from '@/components/shared/DimensionDisplay';
import { Event } from '@/types';
import { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';

interface EventCardProps {
  rect: Rectangle;
  event: Event;
  isHighlighted: boolean;
  isExpanded: boolean;
  eventTypeBorderColor: string;
  userRole: string;
  activeDropdownId: string | undefined;
  dimensions: Array<{
    id: string;
    name: string;
    description?: string;
    type: string;
  }>;
  onCardClick: (id: string) => void;
  onDropdownToggle: (id: string | undefined) => void;
  onEdit: (rect: Rectangle) => void;
  onDelete: (rect: Rectangle) => void;
  onViewDescription: (id: string, description: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  rect,
  event,
  isHighlighted,
  isExpanded,
  eventTypeBorderColor,
  userRole,
  activeDropdownId,
  dimensions,
  onCardClick,
  onDropdownToggle,
  onEdit,
  onDelete,
  onViewDescription,
}) => {
  // Common function to render a metadata field with label and value
  const renderMetadataField = (
    label: string,
    value: string | undefined,
    titleValue?: string
  ) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
        <span className="font-medium min-w-[90px] whitespace-nowrap">
          {label}:
        </span>
        <span className="truncate pr-16" title={titleValue || value}>
          {value}
        </span>
      </div>
    );
  };

  // Render event category and action for non-pageview events
  const renderEventMetadata = () => {
    if (!event) return null;

    return (
      <>
        {event.eventType !== 'pageview' &&
          renderMetadataField('Event Category', event.category)}
        {renderMetadataField('Event Action', event.action)}
      </>
    );
  };

  // Render pageview specific fields
  const renderPageViewFields = () => {
    if (!event || event.eventType !== 'pageview') return null;

    return (
      <>
        {renderMetadataField('Custom Title', event.name)}
        {renderMetadataField('Custom URL', event.category)}
      </>
    );
  };

  // Render action menu based on user role
  const renderActionMenu = () => {
    if (userRole === 'admin') {
      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onDropdownToggle(
                activeDropdownId === rect.id ? undefined : rect.id
              );
            }}
            className="p-1.5 text-gray-500 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>
          <ActionDropdown
            isOpen={activeDropdownId === rect.id}
            onClose={() => onDropdownToggle(undefined)}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDescription={(id, description) => {
              onViewDescription(id, description);
            }}
            event={{
              id: rect.id || '',
              startX: rect.startX,
              startY: rect.startY,
              width: rect.width,
              height: rect.height,
              eventType: rect.eventType || '',
              eventAction: event?.action || '',
              description: event?.description,
            }}
            isAdmin={userRole === 'admin'}
          />
        </div>
      );
    } else if (event?.description) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDescription(rect.id || '', event.description || '');
          }}
          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          <FiInfo className="w-4 h-4" stroke="currentColor" />
        </button>
      );
    }

    return null;
  };

  // Render expanded details
  const renderExpandedDetails = () => {
    if (!isExpanded || !event) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        {event.eventType !== 'pageview' &&
          renderMetadataField('Event Name', event.name)}
        {renderMetadataField('Event Value', event.value)}

        {event.dimensions && event.dimensions.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Dimensions:</span>
            <div className="mt-2 space-y-1.5">
              {event.dimensions.map((dim: string) => {
                const dimension = dimensions.find((d) => d.id === dim);
                return dimension ? (
                  <DimensionDisplay
                    key={dim}
                    dimension={dimension}
                    eventId={event.id}
                  />
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get card style based on highlight state
  const getCardStyle = () => {
    if (isHighlighted) {
      return {
        borderColor: eventTypeBorderColor,
        '--tw-ring-color': eventTypeBorderColor,
      } as React.CSSProperties;
    }
    return undefined;
  };

  // Get card class name based on highlight state
  const getCardClassName = () => {
    return `p-4 rounded-md transition-all relative cursor-pointer ${
      isHighlighted
        ? 'border ring-1 ring-opacity-50'
        : 'border border-gray-200 hover:bg-gray-50'
    }`;
  };

  return (
    <div
      id={`event-card-${rect.id}`}
      className={getCardClassName()}
      style={getCardStyle()}
      onClick={() => onCardClick(rect.id || '')}
    >
      {renderEventMetadata()}
      {renderPageViewFields()}

      {/* Action Menu */}
      <div className="absolute top-3 right-3">{renderActionMenu()}</div>

      {renderExpandedDetails()}
    </div>
  );
};

export default EventCard;
