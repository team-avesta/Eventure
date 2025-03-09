import { Module, EventType } from '@/services/adminS3Service';
import {
  FiEye,
  FiCheckSquare,
  FiTarget,
  FiExternalLink,
  FiServer,
} from 'react-icons/fi';

interface AnalyticsOverviewProps {
  modules: Module[];
}

const EVENT_TYPE_INFO = {
  [EventType.PageView]: {
    name: 'Page Views',
    color: '#2563EB',
    icon: <FiEye className="w-5 h-5" />,
  },
  [EventType.TrackEventWithPageView]: {
    name: 'Track + PageView',
    color: '#16A34A',
    icon: <FiCheckSquare className="w-5 h-5" />,
  },
  [EventType.TrackEvent]: {
    name: 'Track Event',
    color: '#9333EA',
    icon: <FiTarget className="w-5 h-5" />,
  },
  [EventType.Outlink]: {
    name: 'Outlink',
    color: '#DC2626',
    icon: <FiExternalLink className="w-5 h-5" />,
  },
  [EventType.BackendEvent]: {
    name: 'Backend Event',
    color: '#F59E0B',
    icon: <FiServer className="w-5 h-5" />,
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
