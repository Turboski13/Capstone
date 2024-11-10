import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigations from '../components/Navigations';
import { searchAllUsers, searchSingleUser } from '../functions/userFunctions';

import {
  searchAllTeams,
  createTeam,
  joinTeam,
  addPlayerToTeam,
  // invitePlayerToTeam,
  removePlayerFromTeam,
  deleteDmTeam,
} from '../functions/dmFunctions';

const DMHome = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [newTeamForm, setNewTeamForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [assets, setAssets] = useState('');
  const [teamPW, setTeamPW] = useState('');
  const [joinTeamId, setJoinTeamId] = useState(null);
  const [teamSearchInput, setTeamSearchInput] = useState('');
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setError(null);
      setLoading(true);
      try {
        const allTeams = await searchAllTeams();
        if (Array.isArray(allTeams)) {
          setTeams(allTeams);
        }
      } catch (err) {
        setError('Failed to fetch teams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
    //uncomment this if you guys think that you want to see all players for some reason instead of all teams
    // const fetchData = async () => {
    //   await Promise.all([fetchPlayers(), fetchTeams()]);
    //   setLoading(false);

    // fetchData();
    //   };
  }, []);

  useEffect(() => {
    if (Array.isArray(teams)) {
      setFilteredTeams(
        teams.filter((team) =>
          team.name.toLowerCase().includes(teamSearchInput.toLowerCase())
        )
      );
    }
  }, [teamSearchInput, teams]);

  const handleDeleteTeam = async (teamId, password) => {
    console.log('Team ID:', teamId); 
  
    const token = localStorage.getItem('token'); 
    if (!token) {
      setError('No valid token found. Please log in.');
      return;
    }
  
    try {
      await deleteDmTeam(token, teamId, password);  
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
    } catch (err) {
      setError('Failed to delete team. Please try again.');
    }
  };

  const handleAddPlayerToTeam = async (teamId) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // console.log('Token:', token);
    // console.log('User ID:', userId);

    if (!userId) {
      setError('No user ID found. Please log in again.');
      return;
    }

    try {
      await addPlayerToTeam(teamId, userId, token);
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return { ...team, users: [...team.users, userId] };
          }
          return team;
        })
      );
    } catch (err) {
      setError('Failed to add user to team. Please try again');
    }
  };

  const handleRemovePlayerFromTeam = async (teamId, userId) => {
    try {
      await removePlayerFromTeam(teamId, userId);
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              users: team.users.filter((user) => user.id !== userId),
            };
          }
          return team;
        })
      );
    } catch (err) {
      setError('Failed to remove player from team. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token on logout
    navigate('/login');
    console.log('Logging out...');
  };

  const createNewTeam = async (nameOfTeam, roomCode, anyAssets) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a team.');
      return;
    }

    setNewTeamForm(false);

    try {
      const response = await createTeam(nameOfTeam, roomCode, anyAssets, token);
      console.log('New team created:', response);
      setTeams((prevTeams) => [...prevTeams, response.team]);
    } catch (err) {
      console.log('problem with creating team', err);
      setError('Failed to create the team. Please try again.');
    }
  };

  const handleJoinTeam = async (teamId, teamPW) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be loggied in to join a team');
      return;
    }

    try {
      await joinTeam(teamId, teamPW, token);
      setSelectedTeam(teams.find((team) => team.id === teamId));
    } catch (err) {
      setError('Failed to join the team.');
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!teamPW) {
      setError('Please enter a team password');
      return;
    }
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to join a team');
        return;
      }

      // Join the team
      const updatedTeam = await joinTeam(joinTeamId, teamPW, token);

      // Update the team state with the updated team details
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === updatedTeam.id ? updatedTeam : team
        )
      );

      // Clear the input fields and reset the state
      setJoinTeamId(null);
      setTeamPW('');
      setError(null);
      alert('Successfully joined the team!');
    } catch (err) {
      setError('Failed to join the team. Please check the password.');
    }
  };

  const handleJoinClick = (teamId) => {
    setJoinTeamId(teamId);
    setTeamPW('');
    setError(null);
  };

  return (
    <div className='dm-home'>
      <ul className='dm-nav-ul'>
        <li>
          <Link to='/' className='dm-nav'>
            Home
          </Link>
        </li>
        <li>
          <Link to='/how-to-play' className='dm-nav'>
            How to Play
          </Link>
        </li>
        <li>
          <Link to='/about-characters' className='dm-nav'>
            Characters
          </Link>
        </li>
        <li>
          <Link to='/player-home' className='dm-nav'>
            Player Home
          </Link>
        </li>
        <button onClick={handleLogout}>Logout</button>
      </ul>

      <h2 className='dm-h2'>Diva Manager Home</h2>
      {error && <p style={{ color: 'red', padding: 10 }}>{error}</p>}
      {newTeamForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createNewTeam(teamName, roomPassword, assets);
          }}
          className='team-name'
        >
          <div className='form-group'>
            <label htmlFor='name' className='team-label'>
              Team Name:
            </label>
            <input
              type='text'
              id='name'
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='password' className='team-label'>
              Password:
            </label>
            <input
              type='password'
              id='password'
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
          
          </div>
          <button type='submit'>Create Team</button>
        </form>
      )}
      <button
        onClick={() => setNewTeamForm((prevState) => !prevState)}
        className='submit-btn'
      >
        {newTeamForm ? 'Cancel' : 'Create New Team'}
      </button>
      {/* add the below back if you guys want the player list to show up again. Also did you mean character list and not player? */}
      {/* <h3 className='dm-h3'>Player List</h3>
      {players.length === 0 ? (
        <p>No players available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id}>
                <td>{player.username}</td>
                <td>{player.email}</td>
                <td>
                  <button onClick={() => handleDelete(player.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )} */}
      <h3 className='dm-h3'>Teams List</h3>
      <h3 id='search-label'>Search for a specific team</h3>
      <input
        id='team-search'
        type='text'
        placeholder='Search For Teams Here'
        value={teamSearchInput}
        onChange={(e) => setTeamSearchInput(e.target.value)}
      />
      <h3>Teams List</h3>
      {filteredTeams.length === 0 ? (
        <p>No teams available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>
                  <button onClick={() => handleDeleteTeam(team.id)}>
                    Delete
                  </button>
                  
                  <button onClick={() => handleJoinClick(team.id)}>Join</button>

                  {/* Add/Remove Users */}
                  {Array.isArray(team.users) && team.users.length > 0 ? (
                    <ul>
                      {team.users.map((user) => (
                        <li key={user.id}>
                          {user.username}
                          <button
                            onClick={() => handleAddPlayerToTeam(team.id)}
                          >
                            Add Player
                          </button>
                          <button
                            onClick={() =>
                              handleRemovePlayerFromTeam(team.id, user.id)
                            }
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No users yet</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Show Team Info and Functions */}
      {selectedTeam && (
        <div>
          <h3>{selectedTeam.name} - Team Info</h3>
          <ul>
            {selectedTeam.users && selectedTeam.users.length > 0 ? (
              selectedTeam.users.map((user) => (
                <li key={user.id}>
                  {user.username}
                  <button
                    onClick={() =>
                      handleRemovePlayerFromTeam(selectedTeam.id, user.id)
                    }
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <p>No players in this team yet.</p>
            )}
          </ul>
        </div>
      )}
      {/* Join team form if clicked on Join */}
      {joinTeamId && (
        <div className='join-team-form'>
          <form onSubmit={handleJoinSubmit}>
            <input
              type='password'
              value={teamPW}
              onChange={(e) => setTeamPW(e.target.value)}
              placeholder='Enter Team Password'
              required
            />
            <button type='submit' disabled={loading}>
              Submit
            </button>
          </form>

          {/* Display error message if any */}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* Display loading message */}
          {loading && <p>Loading...</p>}
        </div>
      )}{' '}
    </div>
  );
};

export default DMHome;
