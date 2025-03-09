import { FiGrid, FiEye, FiCopy, FiBox, FiZap, FiTag } from 'react-icons/fi';

export interface AdminSection {
  title: string;
  description: string;
  type:
    | 'module'
    | 'pageview'
    | 'dimension'
    | 'category'
    | 'action'
    | 'name'
    | 'dimensionType'
    | 'pageLabel';
  icon: React.ReactNode;
}

export const adminSections: AdminSection[] = [
  {
    title: 'Modules',
    description: 'Manage modules and their screenshots',
    type: 'module',
    icon: <FiGrid className="w-6 h-6" />,
  },
  {
    title: 'Page Labels',
    description: 'Manage page labels for organizing screenshots',
    type: 'pageLabel',
    icon: <FiTag className="w-6 h-6" />,
  },
  {
    title: 'PageView Events',
    description: 'Configure pageview event settings',
    type: 'pageview',
    icon: <FiEye className="w-6 h-6" />,
  },
  {
    title: 'Dimensions',
    description: 'Manage tracking dimensions',
    type: 'dimension',
    icon: <FiCopy className="w-6 h-6" />,
  },
  {
    title: 'Dimension Types',
    description: 'Manage dimension data types',
    type: 'dimensionType',
    icon: <FiCopy className="w-6 h-6" />,
  },
  {
    title: 'Event Categories',
    description: 'Manage event categories',
    type: 'category',
    icon: <FiBox className="w-6 h-6" />,
  },
  {
    title: 'Event Action Names',
    description: 'Manage event action names',
    type: 'action',
    icon: <FiZap className="w-6 h-6" />,
  },
  {
    title: 'Event Names',
    description: 'Manage event names',
    type: 'name',
    icon: <FiTag className="w-6 h-6" />,
  },
];
