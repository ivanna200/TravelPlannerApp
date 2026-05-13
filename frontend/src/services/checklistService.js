import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const checklistService = {
  getPlanItems: async (travelPlanId) => {
    const response = await axios.get(`${API_URL}/api/checklist/plan/${travelPlanId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  createItem: async (data) => {
    const response = await axios.post(`${API_URL}/api/checklist`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  toggleItem: async (id) => {
    const response = await axios.patch(`${API_URL}/api/checklist/${id}/toggle`, {}, {
      headers: getHeaders(),
    });
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await axios.delete(`${API_URL}/api/checklist/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

export default checklistService;