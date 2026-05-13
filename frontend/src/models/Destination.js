export const createDestination = (data) => ({
  id: data.id || null,
  name: data.name || '',
  location: data.location || '',
  arrivalDate: data.arrivalDate || '',
  departureDate: data.departureDate || '',
  description: data.description || '',
  travelPlanId: data.travelPlanId || null,
});