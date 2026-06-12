import { sharedApi } from './axiosConfig';

const sharedPlanService = {
  updatePlan: async (shareToken, data) => {
    const response = await sharedApi.put(`/api/sharing/${shareToken}/plan`, data);
    return response.data;
  },

  addDestination: async (shareToken, data) => {
    const response = await sharedApi.post(`/api/sharing/${shareToken}/destinations`, data);
    return response.data;
  },

  deleteDestination: async (shareToken, id) => {
    const response = await sharedApi.delete(`/api/sharing/${shareToken}/destinations/${id}`);
    return response.data;
  },

  updateDestination: async (shareToken, id, data) => {
    const response = await sharedApi.put(`/api/sharing/${shareToken}/destinations/${id}`, data);
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

  updateActivity: async (shareToken, id, data) => {
    const response = await sharedApi.put(`/api/sharing/${shareToken}/activities/${id}`, data);
    return response.data;
  },
};

export default sharedPlanService;
