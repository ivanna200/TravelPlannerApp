import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const sharingService = {
  createShareToken: async (data) => {
    const response = await axios.post(`${API_URL}/api/sharing`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getSharedPlan: async (token) => {
    const response = await axios.get(`${API_URL}/api/sharing/${token}/plan`);
    return response.data;
  },

  validateToken: async (token) => {
    const response = await axios.get(`${API_URL}/api/sharing/${token}/validate`);
    return response.data;
  },

  getQrCodeUrl: (token) => `${API_URL}/api/sharing/${token}/qr-code`,
};

export default sharingService;