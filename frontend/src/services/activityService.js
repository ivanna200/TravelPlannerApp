import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const activityService = {
  getPlanActivities: async (travelPlanId) => {
    const response = await axios.get(`${API_URL}/api/activities/plan/${travelPlanId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getActivitiesByDate: async (travelPlanId, date) => {
    const response = await axios.get(
      `${API_URL}/api/activities/plan/${travelPlanId}/date/${date}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  createActivity: async (data) => {
    const response = await axios.post(`${API_URL}/api/activities`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updateActivity: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/activities/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  deleteActivity: async (id) => {
    const response = await axios.delete(`${API_URL}/api/activities/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

export default activityService;