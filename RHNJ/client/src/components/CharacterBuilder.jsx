import React, { useState } from 'react';
import characters from '../utils/characterList';
import { useNavigate } from 'react-router-dom';
import { createCharacter } from '../api';
/*import { searchAllUserCharacters, deleteUserCharacter } from '../functions/userFunctions';
import Navigations from './Navigations'; */

const CharacterBuilder = ({ onCharacterSelect, setCharacters }) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterDetails, setCharacterDetails] = useState({});
  const [ideals, setIdeals] = useState('');
  const [flaws, setFlaws] = useState('');
  const [notes, setNotes] = useState('');
  const [characterName, setCharacterName] = useState('');
  const navigate = useNavigate();

  // Handle character selection from the dropdown
  const handleCharacterChange = (event) => {
    const characterId = Number(event.target.value);
  /*   console.log("Selected Character ID:", characterId); */


    // Find the selected character based on ID
    const character = characters.find((char) => char.id === characterId);
    /* console.log("Found Character:", character); */
    setSelectedCharacterId(characterId);
    setSelectedCharacter(character);

    if (character) {
      onCharacterSelect(character);
    }
  };

  const saveCharacterDetails = async () => {
    const characterData = {
      userId: selectedCharacter.userId,
      level: selectedCharacter.level,
      characterName: characterName,
      characterClass: selectedCharacter.characterClass,
      image: selectedCharacter.image,
      attributes: {
        strength: selectedCharacter.attributes.strength,
        dexterity: selectedCharacter.attributes.dexterity,
        constitution: selectedCharacter.attributes.constitution,
        intelligence: selectedCharacter.attributes.intelligence,
        wisdom: selectedCharacter.attributes.wisdom,
        charisma: selectedCharacter.attributes.charisma,
      },

      savingThrows: selectedCharacter.attributes.savingThrows,
      skills: selectedCharacter.skills,
      singleUseSkill: selectedCharacter.singleUseSkill,
      statusPoints: selectedCharacter.statusPoints,
      attackRoll: selectedCharacter.attackRoll,
      catchPhrases: selectedCharacter.catchPhrases,
      abilities: selectedCharacter.abilities,
      ideals: ideals,
      flaws: flaws,
      notes: notes,
    };
    setCharacterDetails(characterData);
    console.log('Character data to be sent:', characterData);

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token in local Store');
      return;
    }

      try {
        const response = await createCharacter(token, characterData);
        console.log("Response received:", response);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }


      const data = await response.json();
      console.log('Character saved:', data);

      setSelectedCharacter(null);
      setSelectedCharacterId(null);
    } catch (error) {
      console.error('Error saving character:', error);
    }
    window.location.href = '/player-home';
  };
  
  
  return (
    <div className='char-build'>
      {/* Character Dropdown */}
      

      <select
        id='character-select'
        value={selectedCharacterId}
        onChange={handleCharacterChange}
        className='character-select'
      >
        <option value=''>-- Create a new character--</option>

        {characters.map((character) => (
          <option key={character.id} value={character.id}>
            {character.characterClass}
          </option>
        ))}
      </select>

      {/* Display Selected Character's Stats */}
      {selectedCharacter && (
        <div className='character-stats'>
          <h3 className='char-stats'>{selectedCharacter.characterName}</h3>

          <label htmlFor='name' className='char-label'>Name:</label>

          <input
            type='text'
            id='character-name'
            name='character-name'
            value={selectedCharacter.characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter your character's name"
            className='char-input'
          />

          <p className='char-txt'>
            Description: {selectedCharacter.description}
          </p>
          <br></br>
          <ul>
            <li>Level: {selectedCharacter.level}</li>
            <li>Strength: {selectedCharacter.attributes.strength}</li>
            <li>Dexterity: {selectedCharacter.attributes.dexterity}</li>
            <li>Constitution: {selectedCharacter.attributes.constitution}</li>
            <li>Intelligence: {selectedCharacter.attributes.intelligence}</li>
            <li>Wisdom: {selectedCharacter.attributes.wisdom}</li>
            <li>Charisma: {selectedCharacter.attributes.charisma}</li>
          </ul>
          <p className='char-txt'>
            Saving Throws:{' '}
            {selectedCharacter.attributes.savingThrows?.map((save, index) => (
              <span key={index}>
                {save}

                {index < selectedCharacter.attributes.savingThrows.length - 1 ? ', ' : ''}

              </span>
            ))}
          </p>
          <p className='char-txt'>
            Skills:{' '}
            {selectedCharacter.skills.map((skill, index) => (
              <span key={index}>
                {skill}
                {index < selectedCharacter.skills.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          <p className='char-txt'>
            Single-Use Skills:{' '}
            {selectedCharacter.singleUseSkill.map((skill, index) => (
              <span key={index}>
                {skill}
                {index < selectedCharacter.singleUseSkill.length - 1
                  ? ', '
                  : ''}
              </span>
            ))}
          </p>
          <p className='char-txt'>
            Status Points: {selectedCharacter.statusPoints}
          </p>
          <p className='char-txt'>
            Attack Roll: {selectedCharacter.attackRoll}
          </p>
          <p className='char-txt'>
            Catch Phrases:{' '}
            {selectedCharacter.catchPhrases.map((phrase, index) => (
              <span key={index}>
                {phrase}
                {index < selectedCharacter.catchPhrases.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>

          {/* New Text Inputs */}
          <label htmlFor='ideals' className='char-label'>
            Ideals, convictions, and other things your character holds dear:
          </label>
          <input
            type='text'
            id='ideals'
            name='ideals'
            value={ideals}
            onChange={(e) => setIdeals(e.target.value)}
            placeholder="Enter your character's ideals"
            className='char-input'
          />

          <label htmlFor='flaws' className='char-label'>
            Flaws, skeletons in the closet, and other things that can be used
            against your character:
          </label>
          <input
            type='text'
            id='flaws'
            name='flaws'
            value={flaws}
            onChange={(e) => setFlaws(e.target.value)}
            placeholder="Enter your character's flaws"
            className='char-input'
          />

          <label htmlFor='notes' className='char-label'>
            Notes for yourself:
          </label>
          <input
            type='text'
            id='notes'
            name='notes'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Enter personal notes'
            className='char-input'
          />
        </div>
      )}
      {selectedCharacter && (
        <div className='character-details'>
          <h3>{selectedCharacter.name}</h3>

          <button onClick={async () => await saveCharacterDetails()}>Save</button>

        </div>
      )}
    </div>
  );
};

export default CharacterBuilder;
