import { sharedApi } from './axiosConfig';

const sharedPlanService = {
  addDestination: async (shareToken, data) => {
    const response = await sharedApi.post(`/api/sharing/${shareToken}/destinations`, data);
    return response.data;
  },

  deleteDestination: async (shareToken, id) => {
    const response = await sharedApi.delete(`/api/sharing/${shareToken}/destinations/${id}`);
    return response.data;
  },

  addActivity: async (shareToken, data) => {
    const response = await sharedApi.post(`/api/sharing/${shareToken}/activities`, data);
    return response.data;
  },

  deleteActivity: async (shareToken, id) => {
    const response = await sharedApi.delete(`/api/sharing/${shareToken}/activities/${id}`);
    return response.data;
  },
};

export default sharedPlanService;
