import Navigations from "./Navigations";
import csv from 'csvtojson';
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { searchAllUserCharacters } from "../functions/userFunctions";
import TabSwitcher from "./TabSwitcher";


const PlayArea = () => {
  const [teamInfo, setTeamInfo] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [isDm, setIsDm] = useState(false);
  const [showChars, setShowChars] = useState(false);
  const [userChars, setUserChars] = useState([]);
  const [allData, setAllData] = useState({
    teamName: '',
    dmId: null,
    assets: [],
    characters: [],
    enemies: [],
    users: [],
  });


  const { teamId: paramTeamId } = useParams();

  useEffect(() => {
    if(paramTeamId){
      setTeamId(paramTeamId);
      getTeamInfo(paramTeamId);
    }
  },[paramTeamId])

  const showUserChars = async() => {
    const userChars = await searchAllUserCharacters();
    setUserChars(userChars);
    setShowChars(true);
  };

  const addCharToTeam = async(charId) => {
    const teamPW = teamInfo.password;
    const token = localStorage.getItem('token');

    try{
      const response = await fetch(`http://localhost:3000/api/teams/${teamId}/char-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamPW, charId }),
      });
      const result = await response.json()
      console.log(result);

    }catch(err){
      console.log('couldnt add the character to the team', err);
    }

  }

  const getTeamInfo = async(teamId) => {
    const token = localStorage.getItem('token');
    try{
      const response = await fetch(`http://localhost:3000/api/teams/${teamId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      console.log('getTeamInfo return: ', result);
      const { team } = result;
      setTeamInfo(team)
      setIsDm(team.dmId === result.id);

      const enemies = team.assets.filter((asset) => asset.Enemy);
      setAllData({
        teamName: team.name || '',
        dmId: team.dmId || null,
        assets: team.assets || [],
        characters: team.characters || [],
        enemies,
        users: team.users || [],
      })

    }catch(err){
      console.log('error trying to get all info', err);
    }
  };

  const uploadEnemySheet = async(teamId, csvInfo) => {
    const csvData = await csvInfo.text();
    const token = localStorage.getItem('token');

    try{
      const response = await fetch(`http://localhost:3000/api/teams/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId, csvData }),
      });
      const result = await response.json();
      console.log(result);

    }catch(err){
      console.log(err);
    }
  };

  return (
    <>
    <Navigations />
    {isDm && (

      <div id="container">
      <form id="dm-upload"
      onSubmit={(e) => {e.preventDefault(); uploadEnemySheet(teamId, csvFile);}}>

      <input id="csv-input"
      type="file"
      accept=".csv"
      onChange={(e) => setCsvFile(e.target.files[0])}
      />
      <button onClick={() => uploadEnemySheet(teamId, csvFile)}>Upload</button>
        </form>
    </div>
    )}
    {
      !showChars ? 
      <button onClick={() => showUserChars()}>Add Your Character To This Adventure</button>
      : <button onClick={() => setShowChars(false)}>Hide Character Panel</button>
    }
    {showChars && (
      userChars.map((char) => (
        <div key={char.id}>
          <img src={char.image} />
          <h3>{char.characterName}</h3>
          <h3>{char.level}</h3>
          <h3>{char.characterClass}</h3>
          <button onClick={() => addCharToTeam(char.id)}>Join With This Character</button>
        </div>
      ))
    )}
    <h1>Team: {allData.teamName}</h1>
    <TabSwitcher teamName={allData.teamName} dmId={allData.dmId} assets={allData.assets} characters={allData.characters} enemies={allData.enemies} users={allData.users}/>
    </>
  )

}

export default PlayArea;