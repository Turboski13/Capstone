import React, { useState } from "react";
import characters from "../utils/characterList";


const CharacterBuilder = ({onCharacterSelect}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null); 
  const [ideals, setIdeals] = useState('');
  const [flaws, setFlaws] = useState('');
  const [notes, setNotes] = useState('');

  console.log("Characters array:", characters);

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
    const saveCharacterDetails = () => {
      
      setSelectedCharacter(null);
     }

  return (
    <div>
          {/* Character Dropdown */}
      <label htmlFor="character-select">Choose a Character:</label>
      <select
        id="character-select"
       value={selectedCharacterId}
        onChange={handleCharacterChange}
      >
        <option value="">-- Select a Character --</option>
        {characters.map((character) => (                              
    
          <option key={character.id} value={character.id} >
            {character.class}
          </option>
        ))}
      </select>

      {/* Display Selected Character's Stats */}
      {selectedCharacter && (

        <div className="character-stats">
          <h3>{selectedCharacter.name}'s Stats</h3>
          <p>Description: {selectedCharacter.description}</p>
          <ul>
            <li>Level: {selectedCharacter.level}</li>
            <li>Strength: {selectedCharacter.strength}</li>
            <li>Dexterity: {selectedCharacter.dexterity}</li>
            <li>Constitution: {selectedCharacter.constitution}</li>
            <li>Intelligence: {selectedCharacter.intelligence}</li>
            <li>Wisdom: {selectedCharacter.wisdom}</li>
            <li>Charisma: {selectedCharacter.charisma}</li>
          </ul>
          <p>
            Saving Throws:{" "}
            {selectedCharacter.savingThrows?.map((save, index) => (
              <span key={index}>{save}{index < selectedCharacter.savingThrows.length - 1 ? ', ' : ''}</span>
            ))}
          </p>
          <p>
            Skills:{" "}
            {selectedCharacter.skills.map((skill, index) => (
              <span key={index}>{skill}{index < selectedCharacter.skills.length - 1 ? ', ' : ''}</span>
            ))}
          </p>
          <p>
            Single-Use Skills:{" "}
            {selectedCharacter.singleUseSkill.map((skill, index) => (
              <span key={index}>{skill}{index < selectedCharacter.singleUseSkill.length - 1 ? ', ' : ''}</span>
            ))}
          </p>
          <p>Status Points: {selectedCharacter.statusPoints}</p>
          <p>Attack Roll: {selectedCharacter.attackRoll}</p>
          <p>
            Catch Phrases:{" "}
            {selectedCharacter.catchPhrases.map((phrase, index) => (
              <span key={index}>{phrase}{index < selectedCharacter.catchPhrases.length - 1 ? ', ' : ''}</span>
            ))}
          </p>

          {/* New Text Inputs */}
          <label htmlFor="ideals">
            Ideals, convictions, and other things your character holds dear:
          </label>
          <input
            type="text"
            id="ideals"
            name="ideals"
            value={ideals}
            onChange={(e) => setIdeals(e.target.value)}
            placeholder="Enter your character's ideals"
          />

         <label htmlFor="flaws">
            Flaws, skeletons in the closet, and other things that can be used against your character:
          </label>
          <input
            type="text"
            id="flaws"
            name="flaws"
            value={flaws}
            onChange={(e) => setFlaws(e.target.value)}
            placeholder="Enter your character's flaws"
          />

          <label htmlFor="notes">Notes for yourself:</label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter personal notes"
          />
        </div>
        
      )}
      {selectedCharacter && (
        <div className="character-details">
          <h3>{selectedCharacter.name}'s Details</h3>
          <button onClick={() => saveCharacterDetails()}>Save</button>
        </div>
      )}
    </div>
  );
};

export default CharacterBuilder;

