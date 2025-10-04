 import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

const signup = async (name, email, password, country) => {
  const response = await api.post('/auth/signup', { name, email, password, country });
  return response.data;
};

export default { login, signup };

