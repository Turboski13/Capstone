const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Helper function for making fetch requests
const fetchData = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const responseText = await response.text();

    if (!response.ok) {
      console.error('Error response text:', responseText);
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching data');
    }
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw the error after logging it
  }
};

// DM Signup
export const DmSignUp = async (newDM) => {
  try {
    const response = await fetch(`${API_URL}/auth/dm-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDM),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error signing up');
    }

    return await response.json(); // Return the response data if needed
  } catch (error) {
    console.error('Error during DM signup:', error);
    throw error;
  }
};

// Create a character
export const createCharacter = async (token, characterData) => {
  try {
    console.log('Creating character with token:', token);
    console.log('Character data:', characterData);

    const response = await fetch(`${API_URL}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save character: ${response.statusText}`);
    }

    return response.json(); // Return the character data or the response object if needed
  } catch (error) {
    console.error('Error in createCharacter API call:', error);
    throw error; // Ensure errors are properly propagated for debugging
  }
};

// Search all users
export const searchAllUsers = async () => {
  try {
    return await fetchData(`${API_URL}/users`);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Search a single user
export const searchSingleUser = async (userId) => {
  try {
    return await fetchData(`${API_URL}/users/${userId}`);
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Get all characters for a user
export const searchAllUserCharacters = async (userId) => {
  const token = localStorage.getItem('token');
  console.log('Retrieved token:', token);
  if (!token) {
    console.error('No token found in localStorage.');
    throw new Error('No token found.');
  }

  if (!userId) {
    console.error('User ID is missing or invalid.');
    throw new Error('Invalid user ID.');
  }

  console.log('Fetching characters for userId:', userId);

  try {
    const response = await fetchData(`${API_URL}/users/${userId}/characters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error fetching user characters:', error);
    throw error;
  }
};

// Search a single user character
export const searchSingleUserCharacter = async (characterId) => {
  try {
    return await fetchData(`${API_URL}/characters/${characterId}`);
  } catch (error) {
    console.error('Error fetching character:', error);
    throw error;
  }
};

// Edit user character
export const editUserCharacter = async (characterId, updatedData) => {
  const token = localStorage.getItem('token'); // Ensure the token is available

  if (!token) {
    throw new Error('No token found. Please log in again.');
  }

  try {
    return await fetchData(`${API_URL}/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
  } catch (error) {
    console.error('Error updating character:', error);
    throw error;
  }
};

// Delete user character
export const deleteUserCharacter = async (characterId) => {
  const token = localStorage.getItem('token'); // Ensure the token is available

  if (!token) {
    throw new Error('No token found. Please log in again.');
  }

  try {
    return await fetchData(`${API_URL}/characters/${characterId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    throw error;
  }
};
