 import api from './api';

const submitExpense = async (formData) => {
  const response = await api.post('/expenses', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const getMyExpenses = async () => {
  const response = await api.get('/expenses/my-expenses');
  return response.data;
};

const getAllExpenses = async () => {
  const response = await api.get('/expenses/all');
  return response.data;
};

const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export default { submitExpense, getMyExpenses, getAllExpenses, getExpenseById };

