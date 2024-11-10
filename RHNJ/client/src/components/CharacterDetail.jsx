// CharacterDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import characters from '../utils/characterList';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';
import '../index.css';

const CharacterDetail = () => {
  const { id } = useParams();
  const character = characters.find((char) => char.id === parseInt(id));

  if (!character) {
    return <div>Character not found</div>;
  }

  return (
    <div className='character-detail'>
      <Navigations />

      <h2 className='char-class'>{character.class}</h2>
      <img src={character.image} alt={character.class} className='img2' />
      <p className='char-desc'>{character.description}</p>
      <h3 className='char-cp'>Catchphrase</h3>
      <p className='char-desc'>{character.catchPhrases}</p>
      {/* <h3 className='char-att'>Attributes:</h3>
      <ul className='char-att-list'>
        <li>Strength: {character.attributes.strength}</li>
        <li>Dexterity: {character.attributes.dexterity}</li>
        <li>Constitution: {character.attributes.constitution}</li>
        <li>Intelligence: {character.attributes.intelligence}</li>
        <li>Wisdom: {character.attributes.wisdom}</li>
        <li>Charisma: {character.attributes.charisma}</li>
        <li>Saving Throws: {character.attributes.savingThrows.join(', ')}</li>
      </ul> */}
      <h3 className='char-att'>Skills:</h3>
      <ul>
        {character.skills.length > 0 ? (
          character.skills.map((skill, index) => <li key={index}>{skill}</li>)
        ) : (
          <li>No skills available</li>
        )}
      </ul>

      <h3 className='char-att'>Single Use Skill:</h3>
      <p className='char-desc'>{character.singleUseSkill.join(', ')}</p>

      {/* <h3 className='char-att'>Hit Points:</h3>
      <p>{character.hitPoints}</p>

      <h3 className='char-att'>Attack Roll:</h3>
      <p className='char-desc'>{character.attackRoll}</p> */}
      <div>
        <Link to='/about-characters' className='char-link'>
          Back to Character List
        </Link>
      </div>
    </div>
  );
};

export default CharacterDetail;
