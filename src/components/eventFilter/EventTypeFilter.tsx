import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

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
    id?: string;
    eventType?: string;
  }>;
}

export default function EventTypeFilter({
  selectedFilter,
  onFilterChange,
  rectangles,
}: EventTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedType = EVENT_TYPES.find((type) => type.id === selectedFilter);
  const totalCount = rectangles.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{selectedType?.name}</span>
          <span className="bg-gray-100 text-gray-600 px-1.5 rounded-full text-xs">
            {selectedFilter === 'all'
              ? totalCount
              : rectangles.filter((r) => r.eventType === selectedFilter).length}
          </span>
        </div>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {EVENT_TYPES.map((type) => {
            const count =
              type.id === 'all'
                ? totalCount
                : rectangles.filter((r) => r.eventType === type.id).length;
            return (
              <button
                key={type.id}
                onClick={() => {
                  onFilterChange(type.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                  selectedFilter === type.id ? 'bg-gray-50' : ''
                }`}
              >
                <span className="text-gray-700">{type.name}</span>
                <span className="bg-gray-100 text-gray-600 px-1.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
