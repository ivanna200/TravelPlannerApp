import api from './axiosConfig';

const authService = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    if (response.data.user?.token) {
      localStorage.setItem('token', response.data.user.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/api/auth/login', data);
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
    const response = await api.get('/api/users');
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  changeRole: async (id, newRole) => {
    const response = await api.patch(`/api/users/${id}/role`, { role: newRole });
    return response.data;
  },

  validateSession: async () => {
    const user = authService.getCurrentUser();
    if (!user?.id) return;
    const response = await api.get(`/api/users/${user.id}`);
    return response.data;
  },
};

export default authService;
