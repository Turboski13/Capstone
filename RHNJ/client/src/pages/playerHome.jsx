import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  searchAllUserCharacters,
  deleteUserCharacter,
} from '../functions/userFunctions'; // Adjust imports as needed
import CharacterBuilder from '../components/CharacterBuilder'; // Component for creating/editing characters */
import Navigations from '../components/Navigations';



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
      /*console.log("Characters array:", characters);*/
      setCharacters(allCharacters);
    } catch (err) {
      setError('No characters found. Create a character to start!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token:", token); // Check if the token is present
    if (!token) {
      console.log("No token found, navigating to login.");
      navigate('/login'); // Redirect to login if no token is found
    } else {
      fetchCharacters(); // Only fetch characters if the user is authenticated
    }
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
       <Navigations />
        <ul className='ph-ul'>
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
      <div>
      <label htmlFor='character-select'>Create a Character:</label>
      </div>
      <h3>Your Characters</h3>
    <div >
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Class</th>
           </tr>
        </thead>
        <tbody>
          {characters.map((character) => (
            <tr key={character.id}>

              <td>{character.characterName}</td>
              <td>{character.level}</td>
              <td>{character.characterClass}</td>
              
              
              <td>
              <button onClick={() => handleDelete(character.id)}>Delete</button>
              <button onClick={() => navigate(`/user/character/${character.id}`)}>View Details</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default PlayerHome;
