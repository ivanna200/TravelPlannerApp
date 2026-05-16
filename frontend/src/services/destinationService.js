import api from './axiosConfig';

const destinationService = {
  getPlanDestinations: async (travelPlanId) => {
    const response = await api.get(`/api/destinations/plan/${travelPlanId}`);
    return response.data;
  },

  createDestination: async (data) => {
    const response = await api.post('/api/destinations', data);
    return response.data;
  },

  updateDestination: async (id, data) => {
    const response = await api.put(`/api/destinations/${id}`, data);
    return response.data;
  },

  deleteDestination: async (id) => {
    const response = await api.delete(`/api/destinations/${id}`);
    return response.data;
  },
};

export default destinationService;
