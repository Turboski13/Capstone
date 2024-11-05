const baseURL = 'http://localhost:3000/api';

// Helper function to handle fetch requests
const request = async (endpoint, method = 'GET', data = null, token = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseURL}${endpoint}`, config);

    if (!response.ok) {
      let errorData = null;
      try{
        errorData = await response.json();
      }catch(parseError) {
        console.error('Error when trying to parse the JSON: ',parseError);
      }
      const errorDetails = errorData?.error || 'No additional error info to provide';
      throw new Error(`Error: ${response.status} ${response.statusText}, Details: ${errorDetails}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error with request:', error);
    throw error;
  }
};

// Authentication functions
export const signup = async (userData) => {
  return await request('/auth/signup', 'POST', userData);
};

export const login = async (userData) => {
  return await request('/auth/login', 'POST', userData);
};

export const logout = () => {
  localStorage.removeItem('token'); // Clear the token from local storage
  console.log('User logged out');
};

// Character functions
export const fetchCharacters = (token) => {
  return request('/characters', 'GET', null, token);
};

export const createCharacter = (token, characterData) => {
  return request('/characters', 'POST', characterData, token)
}
// User functions
export const fetchUsers = (token) => {
  return request('/users', 'GET', null, token);
};

// Other API functions as needed
export const deleteUser = (token, userId) => {
  return request(`/users/${userId}`, 'DELETE', null, token);
};

export const fetchUser = (token, userId) => {
  return request(`/users/${userId}`, 'GET', null, token);
};

export const updateUser = (token, userId, userData) => {
  return request(`/users/${userId}`, 'PUT', userData, token);
};

export const fetchUserCharacters = (token, userId) => {
  return request(`/users/${userId}/characters`, 'GET', null, token);
};

export const fetchCharacter = (token, characterId) => {
  return request(`/characters/${characterId}`, 'GET', null, token);
};

export const updateCharacter = (token, characterId, characterData) => {
  return request(`/characters/${characterId}`, 'PUT', characterData, token);
};

export const deleteCharacter = (token, characterId) => {
  return request(`/characters/${characterId}`, 'DELETE', null, token);
};
