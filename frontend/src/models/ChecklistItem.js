export const createChecklistItem = (data) => ({
  id: data.id || null,
  name: data.name || '',
  isCompleted: data.isCompleted || false,
  travelPlanId: data.travelPlanId || null,
  createdAt: data.createdAt || '',
});