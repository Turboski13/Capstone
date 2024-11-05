import React, { useState } from 'react';
import characters from '../utils/characterList';
import { createCharacter } from '../api';
import { deleteUserCharacter } from '../functions/userFunctions';

const CharacterBuilder = ({ onCharacterSelect, setCharacters }) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterDetails, setCharacterDetails] = useState({});
  const [ideals, setIdeals] = useState('');
  const [flaws, setFlaws] = useState('');
  const [notes, setNotes] = useState('');
  const [characterName, setCharacterName] = useState('');

  // Handle character selection from the dropdown
  const handleCharacterChange = (event) => {
    const characterId = Number(event.target.value);

    // Find the selected character based on ID
    const character = characters.find((char) => char.id === characterId);
    setSelectedCharacterId(characterId);
    setSelectedCharacter(character);

    if (character) {
      onCharacterSelect(character);
    }
  };

  const saveCharacterDetails = async () => {
    let characterData = {
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
    console.log(characterData);
    const token = localStorage.getItem('token');
    if(!token) {
      console.error('No token in local Store');
      return;
    }
      try {
        const response = await createCharacter(token, characterData);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Character saved:', data);

        setSelectedCharacter(null);
      } catch (error) {
        console.error('Error saving character:', error);
      }
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

  return (
    <div>
      {/* Character Dropdown */}
      <label htmlFor='character-select'>Choose a Character:</label>
      <h3>Your Characters</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((character) => (
            <tr key={character.id}>
              <td>{character.name}</td>
              <td>{character.level}</td>
              <td>
              <button onClick={() => handleDelete(character.id)}>Delete</button>
              <button onClick={() => setSelectedCharacter(character)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <select
        id='character-select'
        value={selectedCharacterId}
        onChange={handleCharacterChange}
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
          <h3>{selectedCharacter.characterName}'s Stats</h3>
          <label htmlFor='name'>Name:</label>
          <input
            type='text'
            id='character-name'
            name='character-name'
            value={selectedCharacter.characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter your character's name"
          />

          <p>Description: {selectedCharacter.description}</p>
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
          <p>
            Saving Throws:{' '}
            {selectedCharacter.savingThrows?.map((save, index) => (
              <span key={index}>
                {save}
                {index < selectedCharacter.savingThrows.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          <p>
            Skills:{' '}
            {selectedCharacter.skills.map((skill, index) => (
              <span key={index}>
                {skill}
                {index < selectedCharacter.skills.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          <p>
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
          <p>Status Points: {selectedCharacter.statusPoints}</p>
          <p>Attack Roll: {selectedCharacter.attackRoll}</p>
          <p>
            Catch Phrases:{' '}
            {selectedCharacter.catchPhrases.map((phrase, index) => (
              <span key={index}>
                {phrase}
                {index < selectedCharacter.catchPhrases.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>

          {/* New Text Inputs */}
          <label htmlFor='ideals'>
            Ideals, convictions, and other things your character holds dear:
          </label>
          <input
            type='text'
            id='ideals'
            name='ideals'
            value={ideals}
            onChange={(e) => setIdeals(e.target.value)}
            placeholder="Enter your character's ideals"
          />

          <label htmlFor='flaws'>
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
          />

          <label htmlFor='notes'>Notes for yourself:</label>
          <input
            type='text'
            id='notes'
            name='notes'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Enter personal notes'
          />
        </div>
      )}
      {selectedCharacter && (
        <div className='character-details'>
          <h3>{selectedCharacter.name}'s Details</h3>
          <button onClick={() => saveCharacterDetails()}>Save</button>
        </div>
      )}
    </div>
  );
};

export default CharacterBuilder;
