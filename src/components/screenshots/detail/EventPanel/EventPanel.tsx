import React from 'react';
import EventTypeFilter from '@/components/eventFilter/EventTypeFilter';
import EventCard from './EventCard';
import { Event } from '@/types';
import { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';

interface EventPanelProps {
  events: Event[];
  rectangles: Rectangle[];
  selectedEventFilter: string;
  highlightedCardId: string | null;
  expandedId: string | null;
  userRole: string;
  activeDropdownId: string | undefined;
  dimensions: Array<{
    id: string;
    name: string;
    description?: string;
    type: string;
  }>;
  onFilterChange: (filter: string) => void;
  onCardClick: (id: string) => void;
  onDropdownToggle: (id: string | undefined) => void;
  onEditEvent: (rect: Rectangle) => void;
  onDeleteEvent: (rect: Rectangle) => void;
  onViewDescription: (id: string, description: string) => void;
  getEventTypeBorderColor: (eventType: string) => string;
}

const EventPanel: React.FC<EventPanelProps> = ({
  events,
  rectangles,
  selectedEventFilter,
  highlightedCardId,
  expandedId,
  userRole,
  activeDropdownId,
  dimensions,
  onFilterChange,
  onCardClick,
  onDropdownToggle,
  onEditEvent,
  onDeleteEvent,
  onViewDescription,
  getEventTypeBorderColor,
}) => {
  // Filter rectangles based on selected filter
  const getFilteredRectangles = () => {
    return rectangles.filter(
      (rect) =>
        selectedEventFilter === 'all' || rect.eventType === selectedEventFilter
    );
  };

  // Sort rectangles by event type
  const getSortedRectangles = (filteredRects: Rectangle[]) => {
    return filteredRects.sort((a, b) => {
      const order = {
        pageview: 1,
        trackevent_pageview: 2,
        trackevent: 3,
        backendevent: 4,
        outlink: 5,
      };
      return (
        (order[a.eventType as keyof typeof order] || 99) -
        (order[b.eventType as keyof typeof order] || 99)
      );
    });
  };

  // Find the corresponding event for a rectangle
  const findEventForRectangle = (rect: Rectangle) => {
    return events.find((e) => e.id === rect.id);
  };

  const filteredRectangles = getFilteredRectangles();
  const sortedRectangles = getSortedRectangles(filteredRectangles);

  const renderEventFilter = () => {
    return (
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-3">
          <h3 className="text-base font-semibold text-gray-900">
            Event Details
          </h3>
          <EventTypeFilter
            selectedFilter={selectedEventFilter}
            onFilterChange={onFilterChange}
            rectangles={rectangles}
          />
        </div>
      </div>
    );
  };

  const renderEventCards = () => {
    return sortedRectangles.map((rect) => {
      const event = findEventForRectangle(rect);

      if (!event) return null;

      return (
        <EventCard
          key={rect.id}
          rect={rect}
          event={event}
          isHighlighted={highlightedCardId === rect.id}
          isExpanded={expandedId === rect.id}
          eventTypeBorderColor={getEventTypeBorderColor(rect.eventType || '')}
          userRole={userRole}
          activeDropdownId={activeDropdownId}
          dimensions={dimensions}
          onCardClick={onCardClick}
          onDropdownToggle={onDropdownToggle}
          onEdit={onEditEvent}
          onDelete={onDeleteEvent}
          onViewDescription={onViewDescription}
        />
      );
    });
  };

  return (
    <div className="w-[400px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {renderEventFilter()}
      <div className="flex-1 overflow-auto">
        <div className="space-y-3 p-4">{renderEventCards()}</div>
      </div>
    </div>
  );
};

export default EventPanel;
