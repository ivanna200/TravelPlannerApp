import { createContext, useContext } from 'react';

export const TravelPlanContext = createContext(null);

export const useTravelPlan = () => {
  const ctx = useContext(TravelPlanContext);
  if (!ctx) throw new Error('useTravelPlan mora biti unutar TravelPlanProvider');
  return ctx;
};
