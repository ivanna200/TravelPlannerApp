export const createActivity = (data) => ({
  id:            data.id            || null,
  name:          data.name          || '',
  date:          data.date          || '',
  time:          data.time          || '',
  location:      data.location      || '',
  description:   data.description   || '',
  estimatedCost: data.estimatedCost || 0,
  status:        data.status        || 'Planned',
  travelPlanId:  data.travelPlanId  || null,
});

export const ACTIVITY_STATUSES = ['Planned', 'Reserved', 'Completed', 'Cancelled'];
