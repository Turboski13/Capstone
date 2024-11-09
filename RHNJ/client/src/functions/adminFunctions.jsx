// client/src/functions/adminFunctions.jsx
const API_URL = 'http://localhost:3000/api';

// Utility function for fetch requests
const fetchData = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found.  Please log in again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized access. Please login again.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      throw new Error(`Error: ${response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
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
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId) => {
  const response = await fetchData(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
  });

  if (response === null) {
    console.log('User successfully deleted');
    return true; // Indicate successful deletion
  }
  console.log('Error or unexpected response:', response);
  return false;
};

// Character Functions
/* export const fetchAllUserCharacters = async (userId) => {
  try {
    const response = await fetchData(`${API_URL}/users/${userId}/characters`);
    console.log('API Response:', response); // Log the response
    if (!response.ok) {
      throw new Error(`Failed to fetch characters: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching characters for user with ID ${userId}:`,
      error
    );
    throw error; // Rethrow or return a custom error message
  }
}; */
export const fetchAllUserCharacters = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No token found. Please log in again.');
    }

    const apiUrl = `${API_URL}/users/${userId}/characters`;
    console.log('Fetching characters from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Raw response:', response);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Error details:', errorDetails); // Log server error message
      throw new Error(`Failed to fetch characters: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched characters data:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching characters for user with ID ${userId}:`, error);
    throw error;
  }
};


export const searchSingleUserCharacter = async (characterId) => {
  try {
    return await fetchData(`${API_URL}/characters/${characterId}`);
  } catch (error) {
    console.error(`Error fetching character with ID ${characterId}:`, error);
    throw error;
  }
};

export const editUserCharacter = async (characterId, characterData) => {
  try {
    return await fetchData(`${API_URL}/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(characterData),
    });
  } catch (error) {
    console.error(`Error updating character with ID ${characterId}:`, error);
    throw error;
  }
};

export const deleteUserCharacter = async (characterId) => {
  try {
    const response = await fetchData(`${API_URL}/characters/${characterId}`, {
      method: 'DELETE',
    });
    if (response === null) {
      console.log('Character successfully deleted');
      return true; // Indicate successful deletion
    }
    console.log('Unexpected response:', response);
    return false; // If something unexpected happens
  } catch (error) {
    console.error('Error deleting character:', error);
    return false; // Return false in case of error
  }
};
