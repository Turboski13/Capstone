import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigations from '../components/Navigations';
import {
  searchAllPlayers,
  searchAllTeams,
  // invitePlayerToTeam,
  removePlayerFromTeam,
} from '../functions/dmFunctions';

const DMHome = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      setError(null);
      try {
        const allPlayers = await searchAllPlayers();
        setPlayers(allPlayers);
      } catch (err) {
        setError('Failed to fetch players. Please try again.');
      }
    };

    const fetchTeams = async () => {
      setError(null);
      try {
        const allTeams = await searchAllTeams();
        setTeams(allTeams);
      } catch (err) {
        setError('Failed to fetch teams. Please try again.');
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchPlayers(), fetchTeams()]);
      setLoading(false);
    };

    fetchData();
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

      <h3 className='dm-h3'>Player List</h3>
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
      )}

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
                <td>{team.name}</td>{' '}
                {/* Adjust this according to your team object */}
                <td>
                  <button onClick={() => handleDelete(team.id)}>Delete</button>{' '}
                  {/* Update with proper delete function */}
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