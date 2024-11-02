// client/src/api.js
/* import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Adjust according to your backend
  }); */
const baseURL = 'http://localhost:3000/api';

const api = ({ baseURL }) => {
  const getdata = async (endpoint) => {
    try{
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },  
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    } catch(error) {
      console.error('Error fetching data ', error);
      throw error;
  }
};

const postData = async (endpoint, data) => {
  try{
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  }catch(error) {
    console.error('Error posting data ', error);
    throw error;
  }
};
return {
  getdata,
  postData,
};
}

export default api;
// Helper function to handle fetch requests
const request = async (endpoint, method = 'GET', data = null, token = null) => {
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
  if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  return response.json();
};




// Authentication
export const signup = async (userData) => {
  return await request('/auth/signup', POST, userData);
};

export const login = async (userData) => {
  return await request('/auth/login', 'POST', userData);
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token'); // Clear the token from local storage
  console.log('User logged out');
  // Add any other cleanup actions if necessary
};

// Characters
export const fetchCharacters = (token) => {
  return request('/characters', 'GET', null, token);
};

export const createCharacter = (token, characterData) => {
  return request('/characters', 'POST', characterData, token);
};

// Add more API functions as needed
export const fetchUsers = (token) => {
  return request('/users', 'GET', null, token);
};

/* export const deleteUser = (token, userId) =>
  api.delete(`/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

export const fetchUser = (token, userId) =>
  api.get(`/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }); 

export const updateUser = (token, userId, userData) =>
  api.put(`/users/${userId}`, userData, { headers: { Authorization: `Bearer ${token}` } });

export const fetchUserCharacters = (token, userId) =>
  api.get(`/users/${userId}/characters`, { headers: { Authorization: `Bearer ${token}` } });

export const fetchCharacter = (token, characterId) =>
  api.get(`/characters/${characterId}`, { headers: { Authorization: `Bearer ${token}` } });

export const updateCharacter = (token, characterId, characterData) =>
  api.put(`/characters/${characterId}`, characterData, { headers: { Authorization: `Bearer ${token}` } });

export const deleteCharacter = (token, characterId) =>
  api.delete(`/characters/${characterId}`, { headers: { Authorization: `Bearer ${token}` } });

export default api; */


// { signup, login, logout, fetchCharacters, createCharacter, fetchUsers };