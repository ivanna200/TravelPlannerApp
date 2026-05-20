import { sharedApi } from './axiosConfig';

const sharedPlanService = {
  addDestination: async (data) => {
    const response = await sharedApi.post('/api/destinations', data);
    return response.data;
  },

  deleteDestination: async (id) => {
    const response = await sharedApi.delete(`/api/destinations/${id}`);
    return response.data;
  },

  addActivity: async (data) => {
    const response = await sharedApi.post('/api/activities', data);
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await sharedApi.delete(`/api/activities/${id}`);
    return response.data;
  },
};

export default sharedPlanService;
