import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const travelPlanService = {
  getUserPlans: async (userId) => {
    const response = await axios.get(`${API_URL}/api/travel-plans/user/${userId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getPlan: async (id) => {
    const response = await axios.get(`${API_URL}/api/travel-plans/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  createPlan: async (data) => {
    const response = await axios.post(`${API_URL}/api/travel-plans`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updatePlan: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/travel-plans/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await axios.delete(`${API_URL}/api/travel-plans/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

export default travelPlanService;