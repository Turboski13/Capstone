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
      <h1>character placeholder</h1>
    {
        characterInfo &&(
            <div>

           <h3>{characterInfo.character.characterName}</h3>
           <h3>{characterInfo.character.flaws}</h3>
            </div>
        )
        }


    
    </>
    
  );
};

export default UserCharacter;

