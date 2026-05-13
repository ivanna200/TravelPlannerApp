import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const authService = {
  register: async (data) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, data);
    return response.data;
  },

  login: async (data) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, data);
    if (response.data.user?.token) {
      localStorage.setItem('token', response.data.user.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => localStorage.getItem('token'),

  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`${API_URL}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  changeRole: async (id, role) => {
    const response = await axios.patch(`${API_URL}/api/users/${id}/role`, role, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

export default authService;