import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';
import { searchSingleUserCharacter } from '../functions/userFunctions';
import { editUserCharacter } from '../functions/userFunctions';
import '../index.css';

const UserCharacter = () => {
  const { id } = useParams();
  const [characterInfo, setCharacterInfo] = useState(null);
  const getCharacters = async(id) => {
    const response = await searchSingleUserCharacter(id);
    console.log(response);
    setCharacterInfo(response);

    }
    useEffect(() => {
        getCharacters(id);
        console.log(characterInfo);
        
    },[])
  return (
      <>
      
    {
        characterInfo &&(
            <div className='character-stats'>

           <h1>{characterInfo.character?.characterName}</h1>
           {/* <p> Catch Phrases:{' '}
            {characterInfo.character.catchPhrases.map((phrase, index) => (
              <span key={index}>
                {phrase}
                {index < characterInfo.character.catchPhrases.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p> */}

           <h3 className='char-txt'>Level:{characterInfo.character?.level} </h3>
           <h3 className='char-txt'>Status Points: {characterInfo.character?.statusPoints}</h3>
           <h2>Stats:</h2>
           <ul>
            <li>Strength: {characterInfo.character.attributes.strength}</li>
            <li>Dexterity: {characterInfo.character.attributes.dexterity}</li>
            <li>Constitution: {characterInfo.character.attributes.constitution}</li>
            <li>Intelligence: {characterInfo.character.attributes.intelligence}</li>
            <li>Wisdom: {characterInfo.character.attributes.wisdom}</li>
            <li>Charisma: {characterInfo.character.attributes.charisma}</li>
           </ul>
         <p> Saving Throws:{' '}
            {characterInfo.character.attributes?.savingThrows?.map((save, index) => (
              <span key={index}>
                {save}
                {index < characterInfo.character.attributes.savingThrows.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
          
          <p className='char-txt'>
            Skills:{' '}
            {characterInfo.character.skills?.map((skill, index) => (
              <span key={index}>
                {skill}
                {index < characterInfo.character.skills.length - 1 ? ', ' : ''}
              </span>
            ))}
            </p>
            <p className='char-txt'>
            Single-Use Skills:{' '}
            {characterInfo.character.singleUseSkill?.map((skill, index) => (
              <span key={index}>
                {skill}
                {index < characterInfo.character.singleUseSkill.length - 1
                  ? ', '
                  : ''}
              </span>
            ))}
          </p> 
          <p className='char-txt'>Attack Roll: {characterInfo.character.attackRoll}</p>
           <h3>Flaws: {characterInfo.character.flaws}</h3>
           <h3>Ideals: {characterInfo.character.ideals}</h3>
           <h3>Notes: {characterInfo.character.notes}</h3>


           {/* <button onClick={async () => await editUserCharacter()}>Edit</button> */}
           
            </div>
        )
        }


    
    </>
    
  );
};

export default UserCharacter;

