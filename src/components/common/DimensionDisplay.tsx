import { Tooltip } from 'react-tooltip';

interface DimensionDisplayProps {
  dimension: {
    id: string;
    name: string;
    description?: string;
    type?: string;
  };
  eventId: string;
}

export default function DimensionDisplay({
  dimension,
  eventId,
}: DimensionDisplayProps) {
  const tooltipId = `dimension-tooltip-${eventId}-${dimension.id}`;

  return (
    <div className="text-sm text-gray-600 flex items-center gap-2 group relative py-1">
      <span className="text-gray-400 min-w-[24px]">
        {String(dimension.id).padStart(2, '0')}.
      </span>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="truncate">
          {dimension.name}
          {dimension.type && (
            <span className="text-xs text-gray-500 italic ml-1">
              ({dimension.type})
            </span>
          )}
        </span>
        {dimension.description && (
          <>
            <svg
              data-testid="info-icon"
              data-tooltip-id={tooltipId}
              className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <Tooltip
              id={tooltipId}
              place="right"
              content={dimension.description}
              className="max-w-[200px] !bg-gray-800 !text-white text-xs !px-3 !py-1.5 z-50 !rounded-md"
            />
          </>
        )}
      </div>
    </div>
  );
}
