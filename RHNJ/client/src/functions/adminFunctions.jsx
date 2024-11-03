/* search all users, search single user, search all dms, search single dm */
/* edit user, delete user, edit dm, delete dm */
/* search all characters, search single character, edit character, delete character */
// client/src/functions/adminFunctions.jsx
import { fetchUsers } from '../api';

/* export const searchSingleUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.statusText}`);
    }

    // Parse and return the response data as JSON
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error; // Re-throw the error for further handling
  }
}; */

export const searchSingleUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.statusText}`);
    }

    // Parse and return the response data as JSON
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error; // Re-throw the error for further handling
  }
};

export const editUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT', // Specify the method
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(userData), // Convert userData to a JSON string
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Error editing user: ${response.statusText}`);
    }

    // Parse and return the response data as JSON
    return await response.json();
  } catch (error) {
    console.error('Error editing user:', error);
    throw error; // Re-throw the error for further handling
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE', // Specify the method
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Error deleting user: ${response.statusText}`);
    }

    return true; // Return true if the deletion was successful
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error; // Re-throw the error for further handling
  }
};

// // DM Functions
// export const searchAllDMs = async () => {
//   try {
//     const response = await fetch(`${API_URL}/dms`); // Adjust API endpoint as needed

//     // Check if the response is OK (status code 200-299)
//     if (!response.ok) {
//       throw new Error(`Error fetching DMs: ${response.statusText}`);
//     }

//     const data = await response.json(); // Parse the JSON from the response
//     return data; // Return the data
//   } catch (error) {
//     console.error('Error fetching DMs:', error);
//     throw error; // Re-throw the error for further handling
//   }
// };

// export const searchSingleDM = async (dmId) => {
//   try {
//     const response = await fetch(`${API_URL}/dms/${dmId}`); // Adjust API endpoint as needed

//     // Check if the response is OK (status code 200-299)
//     if (!response.ok) {
//       throw new Error(`Error fetching DM: ${response.statusText}`);
//     }

//     const data = await response.json(); // Parse the JSON from the response
//     return data; // Return the data
//   } catch (error) {
//     console.error('Error fetching DM:', error);
//     throw error; // Re-throw the error for further handling
//   }
// };


// export const editDM = async (dmId, dmData) => {
//   try {
//     const response = await fetch(`${API_URL}/dms/${dmId}`, {
//       method: 'PUT', // Specify the method as PUT
//       headers: {
//         'Content-Type': 'application/json', // Set the content type
//       },
//       body: JSON.stringify(dmData), // Convert the data to a JSON string
//     });

//     // Check if the response is OK (status code 200-299)
//     if (!response.ok) {
//       throw new Error(`Error editing DM: ${response.statusText}`);
//     }

//     const data = await response.json(); // Parse the JSON response
//     return data; // Return the edited DM data
//   } catch (error) {
//     console.error('Error editing DM:', error);
//     throw error; // Re-throw the error for further handling
//   }
// };

// export const deleteDM = async (dmId) => {
//   try {
//     const response = await fetch(`${API_URL}/dms/${dmId}`, {
//       method: 'DELETE', // Specify the method as DELETE
//     });

//     // Check if the response is OK (status code 200-299)
//     if (!response.ok) {
//       throw new Error(`Error deleting DM: ${response.statusText}`);
//     }

//     return true; // Return true to indicate success
//   } catch (error) {
//     console.error('Error deleting DM:', error);
//     throw error; // Re-throw the error for further handling
//   }
// };

// Character Functions
export const searchAllCharacters = async () => {
  try {
    const response = await fetch(`${API_URL}/characters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
};

export const searchSingleCharacter = async (characterId) => {
  try {
    const response = await fetch(`${API_URL}/characters/${characterId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching character:', error);
    throw error;
  }
};

export const editCharacter = async (characterId, characterData) => {
  try {
    const response = await fetch(`${API_URL}/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error editing character:', error);
    throw error;
  }
};

export const deleteCharacter = async (characterId) => {
  try {
    const response = await fetch(`${API_URL}/characters/${characterId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting character:', error);
    throw error;
  }
};

