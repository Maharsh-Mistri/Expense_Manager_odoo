import api from './api';

const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Get users error:', error.response?.data || error.message);
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    console.log('Creating user with data:', userData);
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Create user error:', error.response?.data || error.message);
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user with data:', userData);
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error.response?.data || error.message);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
