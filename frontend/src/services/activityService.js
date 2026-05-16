import api from './axiosConfig';

const activityService = {
  getPlanActivities: async (travelPlanId) => {
    const response = await api.get(`/api/activities/plan/${travelPlanId}`);
    return response.data;
  },

  getActivitiesByDate: async (travelPlanId, date) => {
    const response = await api.get(`/api/activities/plan/${travelPlanId}/date/${date}`);
    return response.data;
  },

  createActivity: async (data) => {
    const response = await api.post('/api/activities', data);
    return response.data;
  },

  updateActivity: async (id, data) => {
    const response = await api.put(`/api/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/api/activities/${id}`);
    return response.data;
  },
};

export default activityService;
