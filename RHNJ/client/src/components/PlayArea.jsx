import Navigations from "./Navigations";
import csv from 'csvtojson';
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";


const PlayArea = () => {
  const [teamName, setTeamName] = useState('');
  const [teamInfo, setTeamInfo] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [isDm, setIsDm] = useState(false);


  const { teamId: paramTeamId } = useParams();

  useEffect(() => {
    if(paramTeamId){
      setTeamId(paramTeamId);
      getTeamInfo(paramTeamId);
    }
  },[paramTeamId])

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
      setTeamInfo(result.team)
      setIsDm(result.team.dmId === result.id);

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
      onSubmit={(e) => {e.preventDefault(); uploadEnemySheet(teamName, csvFile);}}>
        
      <input id="team-id" //this might change since I will probably set the teamId on successful pw join
      type="text"
      placeholder="Team Name"
      value={teamName}
      onChange={(e) => setTeamName(e.target.value)}>
      </input>

      <input id="csv-input"
      type="file"
      accept=".csv"
      onChange={(e) => setCsvFile(e.target.files[0])}
      />
      <button onClick={() => uploadEnemySheet(teamName, csvFile)}>Upload</button>
        </form>
    </div>
    )}
    <h1>normal users only see this</h1>
    </>
  )

}

export default PlayArea;