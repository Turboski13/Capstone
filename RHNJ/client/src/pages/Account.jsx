import { useEffect, useState } from 'react'; 
import { searchAllUserCharacters } from '../functions/userFunctions';
import { getAllUserTeams } from '../functions/dmFunctions';

const Account = () => {
  const [userCharacters, setUserCharacters] = useState([]);
  const [userTeam, setUserTeam] = useState([]);
  const [showAssets, setShowAssets] = useState(false);


  const getUserCharacters = async() => {
    const response = await searchAllUserCharacters();
    setUserCharacters(response);
    console.log(response);
  };

  const getUserTeams = async() => {
    const response = await getAllUserTeams();
    const result = await response.getUser.teams;
    setUserTeam(result);
  };

  useEffect(() => {
    getUserCharacters();
    getUserTeams();

  },[]);


  return (
    <>
    <div>
      <h2>My Characters:</h2>
      {
        userCharacters && (
          userCharacters.map((character) =>
          <div key={character.id}>
            <h2>{character.name}</h2>
            <img src={character?.image}/>
            <button>Join your team's game</button>
          </div>)
        )
      }
      
      <h2>My Teams</h2>
      {
        userTeam && (
          userTeam.map((field) => 
          <div key={field.id}>
            <h2>{field.name}</h2>
            <button onClick={() => setShowAssets((prev) => !prev)}>Assets</button>
            {
              showAssets && (
                <h2>Assets placeholder - they are an object so we need to parse it diff</h2>
              )
            }
          </div>)
        )
      }


      <h2>Change Password</h2>
    </div>
    </>
  );

};

export default Account;