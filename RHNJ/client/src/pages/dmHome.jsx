import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigations from '../components/Navigations';
import {
  searchAllPlayers,
  searchAllTeams,
  createTeam,
  joinTeam,
  // invitePlayerToTeam,
  removePlayerFromTeam,
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

  

  useEffect(() => {
    // const fetchPlayers = async () => {
    //   setError(null);
    //   try {
    //     const allPlayers = await searchAllPlayers();
    //     setPlayers(allPlayers);
    //   } catch (err) {
    //     setError('Failed to fetch players. Please try again.');
    //   }
    // };

    const fetchTeams = async () => {
      setError(null);
      try {
        const allTeams = await searchAllTeams();
        setTeams(allTeams);
      } catch (err) {
        setError('Failed to fetch teams. Please try again.');
      }
    };

    fetchTeams();
    setLoading(false);
    //uncomment this if you guys think that you want to see all players for some reason instead of all teams
    // const fetchData = async () => {
    //   await Promise.all([fetchPlayers(), fetchTeams()]);
    //   setLoading(false);
    // };
    

    // fetchData();
  }, []);

  const handleDelete = async (playerId) => {
    try {
      await removePlayerFromTeam(playerId);
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== playerId)
      );
    } catch (err) {
      setError('Failed to delete player. Please try again.');
    }
  };

  const handleLogout = () => {
    // logout(); // Call the logout function
    navigate('/login');
    console.log('Logging out...');
  };

  if (loading) {
    return <p>Loading players and teams...</p>;
  }

  const createNewTeam = async(nameOfTeam, roomCode, anyAssets) => {
    setNewTeamForm(false);
    const token = localStorage.getItem('token');
    try{
      const response = await createTeam(nameOfTeam, roomCode, anyAssets, token);
      const team = response.json();
      console.log(team);

    }catch(err){
      console.log('problem with creating team', err);
    }
  }
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    handleJoin(joinTeamId, teamPW);
  };
  const handleJoinClick = (teamId) => {
    setJoinTeamId(teamId);
  };

  const handleJoin = async(teamId, teamPW) => {
    const token = localStorage.getItem('token');
    try {
      const response = await joinTeam(teamId, teamPW, token);
      const teamInfo = response;
      console.log(teamInfo);
    }catch(err){
      console.log('couldnt join the team, sorry.', err);
    }

  }

  return (
    <div className='dm-home'>
      <ul className='dm-nav-ul'>
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
        <button onClick={handleLogout} className='dm-nav'>
          Logout
        </button>
      </ul>

      <h2 className='dm-h2'>Diva Manager Home</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {
        newTeamForm && (
          <form onSubmit={() => createNewTeam(teamName, roomPassword, assets)}>
          <div>
            <label htmlFor="name">Team Name:</label>
            <input
              type="text"
              id="name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="assets">Assets (JSON format):</label>
            <textarea
              id="assets"
              value={assets}
              onChange={(e) => setAssets(e.target.value)}
            />
          </div>
          <button type="submit">Create Team</button>
        </form>
        )
      }
      <button onClick={() => setNewTeamForm(prevState => !prevState)}>
        {newTeamForm ? "Cancel" : "Create New Team"}
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
      {teams.length === 0 ? (
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
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>
                {joinTeamId === team.id ? (
                  <form onSubmit={handleJoinSubmit}>
                    <div>
                      <label htmlFor="teamPW">Enter Password:</label>
                      <input
                        type="password"
                        id="teamPW"
                        value={teamPW}
                        onChange={(e) => setTeamPW(e.target.value)}
                      />
                    </div>
                    <button type="submit">Submit</button>
                  </form>
                ) : (
                  <button onClick={() => handleJoinClick(team.id)}>Join</button>
                )}
                <button onClick={() => handleDelete(team.id)}>Delete</button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DMHome;