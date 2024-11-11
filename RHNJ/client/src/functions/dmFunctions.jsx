/* search all team characters, search single team character, edit user character */
/* createte, invite player to team, remove player from team, delete team */
/* increase XP for team and single character */
const API_URL = `/api`;

// Helper function for making fetch requests
const fetchData = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    if (!response.ok) {
      console.error('Response Error:', responseData);
      throw new Error(responseData.message || 'Error fetching data');
    }
    return responseData;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// // Search all players
// export const searchAllPlayers = async () => {
//   try {
//     return await fetchData(`${API_URL}/players`);
//   } catch (error) {
//     console.error('Error fetching players:', error);
//     throw error;
//   }
// };

// Search all teams
export const searchAllTeams = async () => {
  try {
    return await fetchData(`${API_URL}/teams`);
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// Search all team characters
export const searchAllTeamCharacters = async (teamId) => {
  try {
    return await fetchData(`${API_URL}/teams/${teamId}/characters`);
  } catch (error) {
    console.error('Error fetching team characters:', error);
    throw error;
  }
};

// Search single team character
export const searchSingleTeamCharacter = async (characterId) => {
  try {
    return await fetchData(`${API_URL}/characters/${characterId}`);
  } catch (error) {
    console.error('Error fetching character:', error);
    throw error;
  }
};

// Edit user character
export const editUserCharacter = async (characterId, updatedData) => {
  try {
    return await fetchData(`${API_URL}/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
  } catch (error) {
    console.error('Error updating character:', error);
    throw error;
  }
};

// Create a team
export const createTeam = async (
  teamName,
  roomPassword = '',
  assets = {},
  token
) => {
  try {
    return await fetchData(`${API_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teamName, roomPassword, assets }),
    });
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const joinTeam = async (teamId, teamPW, token) => {
  try {
    console.log('Joining team with:', { teamId, teamPW, token });

    if (!token) {
      throw new Error('No valid token found.');
    }

    const response = await fetch(`${API_URL}/teams/${teamId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        teamPW,
      }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to join team: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Team joined successfully:', data);
    return data;
  } catch (error) {
    console.error('error joining the team:', error.message);
    throw error;
  }
};

// Add player to team
export const addPlayerToTeam = async (teamId, userId) => {
  const token = localStorage.getItem('token');
  try {
    return await fetch(`${API_URL}/teams/${teamId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error('Failed to add player:', error);
    throw error;
  }
};

// // Invite player to team
// export const invitePlayerToTeam = async (teamId, playerId) => {
//   try {
//     return await fetchData(`${API_URL}/teams/${teamId}/invite`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ playerId }),
//     });
//   } catch (error) {
//     console.error('Error inviting player to team:', error);
//     throw error;
//   }
// };

// Fetch team details by teamId
export const getTeamDetails = async (teamId) => {
  const token = localStorage.getItem('token'); // Make sure you get the token correctly
  try {
    return await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Pass token here if required
      },
    });
  } catch (error) {
    console.error('Error fetching team details:', error);
    throw error;
  }
};

// Remove player from team
export const removePlayerFromTeam = async (teamId, playerId) => {
  try {
    return await fetchData(`${API_URL}/teams/${teamId}/players/${playerId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing player from team:', error);
    throw error;
  }
};

// Delete team
export const deleteTeam = async (teamId) => {
  const token = localStorage.getItem('token');

  // If no token, handle the error (e.g., prompt user to log in)
  if (!token) {
    console.error('No valid token found');
    throw new Error('Unauthorized: No token found');
  }

  try {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle the response based on the status code
    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized error
        const errorText = await response.text(); // Read text response (probably 'Unauthorized')
        console.error('Unauthorized:', errorText);
        throw new Error(
          'Unauthorized: You must be logged in to delete the team'
        );
      } else {
        const errorResponse = await response.json(); // For other errors, parse as JSON
        console.error(
          'Error deleting team:',
          errorResponse.message || 'Unknown error'
        );
        throw new Error(errorResponse.message || 'Failed to delete team');
      }
    }

    // If successful, return the success message
    const data = await response.json();
    console.log('Team deleted successfully:', data.message);
    return data;
  } catch (error) {
    console.error('Error deleting team:', error.message);
    throw error; // Re-throw the error for further handling in the UI
  }
};
// Increase XP for team
export const increaseTeamXP = async (teamId, amount) => {
  if (amount <= 0) {
    throw new Error('XP amount must be greater than 0');
  }
  try {
    return await fetchData(`${API_URL}/teams/${teamId}/xp`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
  } catch (error) {
    console.error('Error increasing team XP:', error);
    throw error;
  }
};

// Increase XP for single character
export const increaseCharacterXP = async (characterId, amount) => {
  if (amount <= 0) {
    throw new Error('XP amount must be greater than 0');
  }
  try {
    return await fetchData(`${API_URL}/characters/${characterId}/xp`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
  } catch (error) {
    console.error(`Error increasing XP for character ${characterId}:`, error);
    throw error;
  }
};
