import { createContext } from 'react';

export const AdminContext = createContext({
  stats: {
    shops: 0,
    routes: 0,
    vehicles: 0
  },
  fetchStats: () => {}
}); 