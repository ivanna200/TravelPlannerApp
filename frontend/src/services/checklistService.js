import api from './axiosConfig';

const checklistService = {
  getPlanItems: async (travelPlanId) => {
    const response = await api.get(`/api/checklist/plan/${travelPlanId}`);
    return response.data;
  },

  createItem: async (data) => {
    const response = await api.post('/api/checklist', data);
    return response.data;
  },

  toggleItem: async (id) => {
    const response = await api.patch(`/api/checklist/${id}/toggle`, {});
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/api/checklist/${id}`);
    return response.data;
  },
};

export default checklistService;
