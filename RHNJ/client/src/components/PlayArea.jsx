import Navigations from "./Navigations";
import csv from 'csvtojson';
import { useState } from "react";


const PlayArea = () => {
  const [teamName, setTeamName] = useState('');
  const [csvFile, setCsvFile] = useState(null);

  const uploadEnemySheet = async(teamId, csvData) => {
    const csvData = await csvFile.text();
    const token = localStorage.getItem('token');

    try{
      const response = await fetch(`/api/teams/upload`, {
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
  }

  return (
    <>
    <Navigations />
    <div id="container">
      <form id="dm-upload"
      onSubmit={(e) => {e.preventDefault(); uploadEnemySheet(teamName, csvInfo);}}>
        
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
        </form>
    </div>
    </>
  )

}

export default PlayArea;