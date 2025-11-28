import api from './api';

const login = async (username, password) => {
  const response = await api.post('/get-token/', { // Assuming api.js has base URL
    username,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    // Important: If your 'api' instance doesn't auto-update headers, 
    // you might need to set the header manually here for the immediate next request.
    api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
  }
  return response.data;
};

// --- ADD THIS FUNCTION ---
const getCurrentUser = async () => {
  // This calls the endpoint we just fixed in Django
  const response = await api.get('/users/employees/me/');
  return response.data;
};

const logout = () => {
  localStorage.removeItem('authToken');
  // Optional: clear header
  delete api.defaults.headers.common['Authorization'];
};

export const authService = {
  login,
  logout,
  getCurrentUser, // Export the new function
};