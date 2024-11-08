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

  const handleDelete = async (characterId) => {
    try {
      await deleteUserCharacter(characterId);
      setCharacters((prevCharacters) =>
        prevCharacters.filter((char) => char.id !== characterId)
      
      );
    } catch (err) {
      console.error('Failed to delete character. Please try again.', err);
    }
  };

  const fetchCharacters = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const allCharacters = await searchAllUserCharacters(userId);
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
      <nav className='ph-nav'>
        <ul className='ph-ul'>
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
            <Link to='/dm-home' className='dm-nav'>
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
        <CharacterBuilder
          onClose={toggleForm}
          characters={characters}
          setCharacters={setCharacters}
          onCharacterSelect={handleCharacterSelect}
        />
      )}
      <label htmlFor='character-select'>Create a Character:</label>
      <h3>Your Characters</h3>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            
          </tr>
        </thead>
        <tbody>
          {characters.map((character) => (
            <tr key={character.id}>
              <td>{character.name}</td>
              <td>{character.level}</td>
              <td>
              <button onClick={() => handleDelete(character.id)}>Delete</button>
              <button onClick={() => navigate(`/user/character/${character.id}`)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerHome;
