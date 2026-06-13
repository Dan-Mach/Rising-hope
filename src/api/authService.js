import api from './api';

const login = async (username, password) => {
  // 🟢 Removed the leading slash before get-token
  const response = await api.post('get-token/', { 
    username,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
  }
  return response.data;
};

const getCurrentUser = async () => {
  // 🟢 Removed the leading slash before users
  const response = await api.get('users/employees/me/');
  return response.data;
};

const logout = () => {
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common['Authorization'];
};

export const authService = {
  login,
  logout,
  getCurrentUser,
};