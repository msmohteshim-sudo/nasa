import { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Mission Console',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'System overview and procedural status',
  },
  {
    label: 'Experiments',
    path: '/experiments',
    icon: 'FlaskConical',
    description: 'Experiment protocols and procedures',
  },
  {
    label: 'Live Monitor',
    path: '/monitor',
    icon: 'Tv',
    description: 'AI activity recognition and camera feed',
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: 'FileText',
    description: 'Experiment evidence and audit trails',
  },
  {
    label: 'System',
    path: '/settings',
    icon: 'Sliders',
    description: 'Vision, voice and procedure settings',
  },
];
