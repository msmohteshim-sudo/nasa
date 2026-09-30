import { SystemStatus } from '@/types';

export const getInitialSystemStatus = (): SystemStatus => {
  return {
    name: 'ALTRON Industrial Core',
    version: '1.0.0-alpha',
    environment: 'development',
    status: 'operational',
    uptimeSeconds: 0,
  };
};
