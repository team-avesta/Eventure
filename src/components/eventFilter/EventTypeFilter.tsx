import { useState } from 'react';

const EVENT_TYPES = [
  { id: 'all', name: 'All Events', color: '#6B7280' },
  { id: 'pageview', name: 'Page View', color: '#2563EB' },
  {
    id: 'trackevent_pageview',
    name: 'TrackEvent with PageView',
    color: '#16A34A',
  },
  { id: 'trackevent', name: 'TrackEvent', color: '#9333EA' },
  { id: 'outlink', name: 'Outlink', color: '#DC2626' },
  { id: 'backendevent', name: 'Backend Event', color: '#F59E0B' },
];

interface EventTypeFilterProps {
  selectedFilter: string;
  onFilterChange: (filterType: string) => void;
  rectangles: Array<{
    id: string;
    eventType: string;
  }>;
}

export default function EventTypeFilter({
  selectedFilter,
  onFilterChange,
  rectangles,
}: EventTypeFilterProps) {
  // Count events by type
  const eventCounts = rectangles.reduce((acc, rect) => {
    acc[rect.eventType] = (acc[rect.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Total count for "All" option
  const totalCount = rectangles.length;

  return (
    <div className="mb-4 sticky top-0 bg-white z-10 pb-3 border-b border-gray-200 p-4">
      <div className="flex flex-wrap gap-1.5">
        {EVENT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onFilterChange(type.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedFilter === type.id
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100'
            }`}
            style={{
              backgroundColor:
                selectedFilter === type.id ? type.color : undefined,
            }}
          >
            {type.name}
            <span
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs ${
                selectedFilter === type.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {type.id === 'all' ? totalCount : eventCounts[type.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
