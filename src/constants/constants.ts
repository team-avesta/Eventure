import { EventType } from '@/services/adminS3Service';
import { EventTypeOption } from '@/types/types';

export const EVENT_TYPES: EventTypeOption[] = [
  { id: EventType.PageView, name: 'Page View', color: '#2563EB' },
  {
    id: EventType.TrackEventWithPageView,
    name: 'TrackEvent with PageView',
    color: '#16A34A',
  },
  { id: EventType.TrackEvent, name: 'TrackEvent', color: '#9333EA' },
  { id: EventType.Outlink, name: 'Outlink', color: '#DC2626' },
  { id: EventType.BackendEvent, name: 'Backend Event', color: '#F59E0B' },
];

export function getEventTypeBorderColor(eventType: string): string {
  const type = EVENT_TYPES.find((t) => t.id === eventType);
  return type ? type.color : '#3B82F6';
}

export function getEventTypeDescription(typeId: string): string {
  switch (typeId) {
    case EventType.PageView:
      return 'Track when users view a page';
    case EventType.TrackEventWithPageView:
      return 'Track user interactions that also trigger a page view';
    case EventType.TrackEvent:
      return 'Track user interactions without a page view';
    case EventType.Outlink:
      return 'Track when users click links to external sites';
    case EventType.BackendEvent:
      return 'Track backend-specific events and operations';
    default:
      return '';
  }
}
