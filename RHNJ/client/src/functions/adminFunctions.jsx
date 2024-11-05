// client/src/functions/adminFunctions.jsx
const API_URL = 'http://localhost:3000/api';

// Utility function for fetch requests
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw the error for further handling
  }
};

// User Functions
export const searchAllUsers = async () => {
  return await fetchData(`${API_URL}/users`);
};

export const searchSingleUser = async (userId) => {
  return await fetchData(`${API_URL}/users/${userId}`);
};

export const editUser = async (userId, userData) => {
  return await fetchData(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId) => {
  await fetchData(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
  });
  return true; // Indicate successful deletion
};

// DM Functions
export const searchAllDMs = async () => {
  return await fetchData(`${API_URL}/dms`);
};

export const searchSingleDM = async (dmId) => {
  return await fetchData(`${API_URL}/dms/${dmId}`);
};

export const editDM = async (dmId, dmData) => {
  return await fetchData(`${API_URL}/dms/${dmId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dmData),
  });
};

export const deleteDM = async (dmId) => {
  await fetchData(`${API_URL}/dms/${dmId}`, {
    method: 'DELETE',
  });
  return true; // Indicate successful deletion
};

// Character Functions
export const searchAllCharacters = async () => {
  return await fetchData(`${API_URL}/characters`);
};

export const searchSingleCharacter = async (characterId) => {
  return await fetchData(`${API_URL}/characters/${characterId}`);
};

export const editCharacter = async (characterId, characterData) => {
  return await fetchData(`${API_URL}/characters/${characterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characterData),
  });
};

export const deleteCharacter = async (characterId) => {
  await fetchData(`${API_URL}/characters/${characterId}`, {
    method: 'DELETE',
  });
  return true; // Indicate successful deletion
};
