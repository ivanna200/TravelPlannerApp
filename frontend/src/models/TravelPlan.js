export const createTravelPlan = (data) => ({
  id:           data.id           || null,
  name:         data.name         || '',
  description:  data.description  || '',
  startDate:    data.startDate    || '',
  endDate:      data.endDate      || '',
  budget:       data.budget       || 0,
  notes:        data.notes        || '',
  userId:       data.userId       || null,
  createdAt:    data.createdAt    || '',
  destinations: data.destinations || [],
  activities:   data.activities   || [],
});
