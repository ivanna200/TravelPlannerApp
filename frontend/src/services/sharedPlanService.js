import api from './axiosConfig';

const sharedPlanService = {
  updatePlan: async (shareToken, data) => {
    const response = await api.put(`/api/sharing/${shareToken}/plan`, data);
    return response.data;
  },

  addDestination: async (shareToken, data) => {
    const response = await api.post(`/api/sharing/${shareToken}/destinations`, data);
    return response.data;
  },

  deleteDestination: async (shareToken, id) => {
    const response = await api.delete(`/api/sharing/${shareToken}/destinations/${id}`);
    return response.data;
  },

  updateDestination: async (shareToken, id, data) => {
    const response = await api.put(`/api/sharing/${shareToken}/destinations/${id}`, data);
    return response.data;
  },

  addActivity: async (shareToken, data) => {
    const response = await api.post(`/api/sharing/${shareToken}/activities`, data);
    return response.data;
  },

  deleteActivity: async (shareToken, id) => {
    const response = await api.delete(`/api/sharing/${shareToken}/activities/${id}`);
    return response.data;
  },

  updateActivity: async (shareToken, id, data) => {
    const response = await api.put(`/api/sharing/${shareToken}/activities/${id}`, data);
    return response.data;
  },

  addExpense: async (shareToken, data) => {
    const response = await api.post(`/api/sharing/${shareToken}/expenses`, data);
    return response.data;
  },

  updateExpense: async (shareToken, id, data) => {
    const response = await api.put(`/api/sharing/${shareToken}/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (shareToken, id) => {
    const response = await api.delete(`/api/sharing/${shareToken}/expenses/${id}`);
    return response.data;
  },

  addChecklistItem: async (shareToken, data) => {
    const response = await api.post(`/api/sharing/${shareToken}/checklist`, data);
    return response.data;
  },

  updateChecklistItem: async (shareToken, id, data) => {
    const response = await api.put(`/api/sharing/${shareToken}/checklist/${id}`, data);
    return response.data;
  },

  toggleChecklistItem: async (shareToken, id) => {
    const response = await api.patch(`/api/sharing/${shareToken}/checklist/${id}/toggle`);
    return response.data;
  },

  deleteChecklistItem: async (shareToken, id) => {
    const response = await api.delete(`/api/sharing/${shareToken}/checklist/${id}`);
    return response.data;
  },
};

export default sharedPlanService;
