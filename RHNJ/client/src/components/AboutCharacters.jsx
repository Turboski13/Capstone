import React from 'react';
import characters from '../utils/characterList'; // Adjust the path as necessary
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';

// import AboutCharacters from './AboutCharacters';

export default function AboutCharacters({
  // setSelectedCharacterID,
  characters,
}) {
  return (
    <div className='about-character'>
      <Navigations />
      {characters && characters.length > 0 ? (
        characters.map((character) => (
          <Link to={`/character/${character.id}`} key={character.id}>
            <div>
              <img
                src={character.image}
                alt={character.characterClass}
                className='char-img'
              />
              <h3>{character.characterClass}</h3>
            </div>
          </Link>
        ))
      ) : (
        <div>No characters available</div>
      )}
    </div>
  );
}
