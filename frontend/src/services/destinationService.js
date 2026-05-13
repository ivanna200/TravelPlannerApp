import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const destinationService = {
  getPlanDestinations: async (travelPlanId) => {
    const response = await axios.get(`${API_URL}/api/destinations/plan/${travelPlanId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  createDestination: async (data) => {
    const response = await axios.post(`${API_URL}/api/destinations`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updateDestination: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/destinations/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  deleteDestination: async (id) => {
    const response = await axios.delete(`${API_URL}/api/destinations/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

export default destinationService;