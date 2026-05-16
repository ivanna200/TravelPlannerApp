import api from './axiosConfig';

const travelPlanService = {
  getUserPlans: async (userId) => {
    const response = await api.get(`/api/travel-plans/user/${userId}`);
    return response.data;
  },

  getPlan: async (id) => {
    const response = await api.get(`/api/travel-plans/${id}`);
    return response.data;
  },

  createPlan: async (data) => {
    const response = await api.post('/api/travel-plans', data);
    return response.data;
  },

  updatePlan: async (id, data) => {
    const response = await api.put(`/api/travel-plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/api/travel-plans/${id}`);
    return response.data;
  },
};

export default travelPlanService;
