import {
  ModuleIcon,
  PageViewIcon,
  DimensionIcon,
  CategoryIcon,
  ActionIcon,
  EventIcon,
} from '@/components/common/icons';

export interface AdminSection {
  title: string;
  description: string;
  type: 'module' | 'pageview' | 'dimension' | 'category' | 'action' | 'event';
  icon: React.ReactNode;
}

export const adminSections: AdminSection[] = [
  {
    title: 'Modules',
    description: 'Manage modules and their screenshots',
    type: 'module',
    icon: <ModuleIcon className="w-6 h-6" />,
  },
  {
    title: 'PageView Events',
    description: 'Configure pageview event settings',
    type: 'pageview',
    icon: <PageViewIcon className="w-6 h-6" />,
  },
  {
    title: 'Dimensions',
    description: 'Manage tracking dimensions',
    type: 'dimension',
    icon: <DimensionIcon className="w-6 h-6" />,
  },
  {
    title: 'Event Categories',
    description: 'Manage event categories',
    type: 'category',
    icon: <CategoryIcon className="w-6 h-6" />,
  },
  {
    title: 'Event Action Names',
    description: 'Manage event action names',
    type: 'action',
    icon: <ActionIcon className="w-6 h-6" />,
  },
  {
    title: 'Event Names',
    description: 'Manage event names',
    type: 'event',
    icon: <EventIcon className="w-6 h-6" />,
  },
];
