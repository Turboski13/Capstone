import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  searchAllUserCharacters,
  deleteUserCharacter,
} from '../functions/userFunctions'; // Adjust imports as needed
import CharacterBuilder from '../components/CharacterBuilder'; // Component for creating/editing characters */

const PlayerHome = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // To toggle the character form
  

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token'); // Remove token from storage
    navigate('/login'); // Redirect to the home or login page
  };

  const fetchCharacters = async () => {
    try {
      const allCharacters = await searchAllUserCharacters();
      setCharacters(allCharacters);
    } catch (err) {
      setError('No characters found. Create a character to start!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const handleCharacterSelect = (character) => {
    console.log('Selected character:', character);
  };
  if (loading) {
    return <p>Loading characters...</p>;
  }

  return (
    <div className='player-home'>
      <nav>
        <ul>
          <li>
            <Link to='/how-to-play' className='nav-left1'>
              How to Play
            </Link>
          </li>
          <li>
            <Link to='/about-characters' className='nav-left1'>
              Characters
            </Link>
          </li>
          <li>
            <Link to='/dm-home' className='nav-left1'>
              DM Home
            </Link>
          </li>
          <button onClick={handleLogout}>Logout</button>
        </ul>
      </nav>
      <h2>Player Homepage</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={toggleForm}>
        {showForm ? 'Cancel' : 'Choose your character'}
        </button>
      {showForm && (
        <CharacterBuilder onClose={toggleForm} characters={characters} setCharacters={setCharacters} onCharacterSelect={handleCharacterSelect} />
      )}
      <h3>Your Characters</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Class</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((userCharacter) => (
            <tr key={userCharacter.id}>
              <img src={userCharacter.image} alt={UserCharacter.class} className='img2' />
              <td>{userCharacter.name}</td>
              <td>{userCharacter.level}</td>
              <td>
              <button onClick={() => handleDelete(userCharacter.id)}>Delete</button>
              <button onClick={() => setSelectedCharacter(userCharacter)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerHome;