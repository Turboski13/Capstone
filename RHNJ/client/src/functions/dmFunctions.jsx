/* search all team characters, search single team character, edit user character */
/* createte, invite player to team, remove player from team, delete team */
/* increase XP for team and single character */
const API_URL = 'http://localhost:3000/api'; // Update with your API URL

// Helper function for making fetch requests
const fetchData = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error fetching data');
  }
  return response.json();
};

// Search all players
export const searchAllPlayers = async () => {
  try {
    return await fetchData(`${API_URL}/players`);
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

// Search all teams
export const searchAllTeams = async () => {
  try {
    const response = await fetch(`${API_URL}/teams`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
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
export const createTeam = async (teamData) => {
  try {
    return await fetchData(`${API_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

// Invite player to team
export const invitePlayerToTeam = async (teamId, playerId) => {
  try {
    return await fetchData(`${API_URL}/teams/${teamId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    });
  } catch (error) {
    console.error('Error inviting player to team:', error);
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
  try {
    return await fetchData(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

// Increase XP for team
export const increaseTeamXP = async (teamId, amount) => {
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
  try {
    return await fetchData(`${API_URL}/characters/${characterId}/xp`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
  } catch (error) {
    console.error('Error increasing character XP:', error);
    throw error;
  }
};