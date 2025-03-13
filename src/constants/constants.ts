import { EEventType } from '@/services/adminS3Service';
import { EventType } from '@/types';

export const EVENT_TYPES: EventType[] = [
  { id: EEventType.PageView, name: 'Page View', color: '#2563EB' },
  {
    id: EEventType.TrackEventWithPageView,
    name: 'TrackEvent with PageView',
    color: '#16A34A',
  },
  { id: EEventType.TrackEvent, name: 'TrackEvent', color: '#9333EA' },
  { id: EEventType.Outlink, name: 'Outlink', color: '#DC2626' },
  { id: EEventType.BackendEvent, name: 'Backend Event', color: '#F59E0B' },
];

export function getEventTypeBorderColor(eventType: string): string {
  const type = EVENT_TYPES.find((t) => t.id === eventType);
  return type ? type.color : '#3B82F6';
}

export function getEventTypeDescription(typeId: EEventType): string {
  switch (typeId) {
    case EEventType.PageView:
      return 'Track when users view a page';
    case EEventType.TrackEventWithPageView:
      return 'Track user interactions that also trigger a page view';
    case EEventType.TrackEvent:
      return 'Track user interactions without a page view';
    case EEventType.Outlink:
      return 'Track when users click links to external sites';
    case EEventType.BackendEvent:
      return 'Track backend-specific events and operations';
    default:
      return '';
  }
}
