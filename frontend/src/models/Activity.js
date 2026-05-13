export const createActivity = (data) => ({
  id: data.id || null,
  name: data.name || '',
  date: data.date || '',
  time: data.time || '',
  location: data.location || '',
  description: data.description || '',
  estimatedCost: data.estimatedCost || 0,
  status: data.status || 'Planirano',
  travelPlanId: data.travelPlanId || null,
});

export const ACTIVITY_STATUSES = ['Planirano', 'Rezervisano', 'Završeno', 'Otkazano'];