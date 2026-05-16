import api from './axiosConfig';

const expenseService = {
  getPlanExpenses: async (travelPlanId) => {
    const response = await api.get(`/api/expenses/plan/${travelPlanId}`);
    return response.data;
  },

  getBudgetSummary: async (travelPlanId, plannedBudget) => {
    const response = await api.get(
      `/api/expenses/plan/${travelPlanId}/budget-summary?plannedBudget=${plannedBudget}`,
    );
    return response.data;
  },

  getByCategory: async (travelPlanId, category) => {
    const response = await api.get(`/api/expenses/plan/${travelPlanId}/category/${category}`);
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post('/api/expenses', data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/api/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/api/expenses/${id}`);
    return response.data;
  },
};

export default expenseService;
