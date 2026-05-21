import api, { sharedApi } from './axiosConfig';

const sharingService = {
  createShareToken: async (data) => {
    const response = await api.post('/api/sharing', data);
    return response.data;
  },

  getPlanSharings: async (travelPlanId) => {
    const response = await api.get(`/api/sharing/plan/${travelPlanId}`);
    return response.data;
  },

  deleteShareToken: async (id) => {
    const response = await api.delete(`/api/sharing/${id}`);
    return response.data;
  },

  getSharedPlan: async (token) => {
    const response = await sharedApi.get(`/api/sharing/${token}/plan`);
    return response.data;
  },

  validateToken: async (token) => {
    const response = await sharedApi.get(`/api/sharing/${token}/validate`);
    return response.data;
  },

  getQrCodeUrl: (token) =>
    `${import.meta.env.VITE_API_URL}/api/sharing/${token}/qr-code`,
};

export default sharingService;
