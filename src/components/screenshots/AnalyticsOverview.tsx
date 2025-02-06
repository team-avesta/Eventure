import { Module, EventType } from '@/services/adminS3Service';

interface AnalyticsOverviewProps {
  modules: Module[];
}

const EVENT_TYPE_INFO = {
  [EventType.PageView]: {
    name: 'Page Views',
    color: '#2563EB',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  [EventType.TrackEventWithPageView]: {
    name: 'Track + PageView',
    color: '#16A34A',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  [EventType.TrackEvent]: {
    name: 'Track Event',
    color: '#9333EA',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
        />
      </svg>
    ),
  },
  [EventType.Outlink]: {
    name: 'Outlink',
    color: '#DC2626',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    ),
  },
  [EventType.BackendEvent]: {
    name: 'Backend Event',
    color: '#F59E0B',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
};

const calculateEventTotals = (modules: Module[]) => {
  const totals = {
    [EventType.PageView]: 0,
    [EventType.TrackEventWithPageView]: 0,
    [EventType.TrackEvent]: 0,
    [EventType.Outlink]: 0,
    [EventType.BackendEvent]: 0,
  };

  modules.forEach((module) => {
    const events = module.screenshots.flatMap((s) => s.events || []);
    events.forEach((event) => {
      if (event?.eventType) {
        totals[event.eventType]++;
      }
    });
  });

  return Object.entries(EVENT_TYPE_INFO).map(([type, info]) => ({
    name: info.name,
    count: totals[type as EventType],
    color: info.color,
    icon: info.icon,
  }));
};

export function AnalyticsOverview({ modules }: AnalyticsOverviewProps) {
  const eventTotals = calculateEventTotals(modules);
  const totalEvents = eventTotals.reduce((sum, event) => sum + event.count, 0);

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl shadow-sm p-8 mb-8 text-center">
        <div
          className="text-4xl font-bold text-blue-900"
          data-testid="total-events"
        >
          {totalEvents}
        </div>
        <div className="text-sm text-blue-600 mt-2 font-medium">
          Total Events across {modules.length} Modules
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {eventTotals.map((event) => (
          <div
            key={event.name}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${event.color}15` }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ color: event.color }}
                >
                  {event.icon}
                </div>
              </div>
              <div>
                <div
                  className="text-2xl font-bold text-gray-900"
                  data-testid={`${event.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}-count`}
                >
                  {event.count}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {event.name}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
