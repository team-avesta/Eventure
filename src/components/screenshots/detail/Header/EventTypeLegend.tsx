import React from 'react';

interface EventType {
  id: string;
  name: string;
  color: string;
}

interface EventTypeLegendProps {
  eventTypes: EventType[];
}

const EventTypeLegend: React.FC<EventTypeLegendProps> = ({ eventTypes }) => {
  return (
    <div className="flex items-center border-t border-gray-100 pt-3">
      <div className="flex items-center gap-6">
        {eventTypes.map((type) => (
          <div key={type.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: type.color }}
            />
            <span className="text-sm text-gray-600">{type.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventTypeLegend;
