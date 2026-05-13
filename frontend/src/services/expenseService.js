import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const expenseService = {
  getPlanExpenses: async (travelPlanId) => {
    const response = await axios.get(`${API_URL}/api/expenses/plan/${travelPlanId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getBudgetSummary: async (travelPlanId, plannedBudget) => {
    const response = await axios.get(
      `${API_URL}/api/expenses/plan/${travelPlanId}/budget-summary?plannedBudget=${plannedBudget}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  getByCategory: async (travelPlanId, category) => {
    const response = await axios.get(
      `${API_URL}/api/expenses/plan/${travelPlanId}/category/${category}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  createExpense: async (data) => {
    const response = await axios.post(`${API_URL}/api/expenses`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/expenses/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await axios.delete(`${API_URL}/api/expenses/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

export default expenseService;