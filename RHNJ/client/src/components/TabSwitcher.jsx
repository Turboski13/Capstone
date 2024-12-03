import React, { useState, useEffect } from "react";
import './TabSwitcher.css';
import DmUi from "./DmUi";

const TabSwitcher = ({ teamId,userId, isDm, teamName, dmId, assets, characters, enemies, users, socket }) => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [characterData, setCharacterData] = useState(characters);
  const [enemyData, setEnemyData] = useState(enemies);
  const [userData, setUserData] = useState(users);
  const [dmSelectedProperties, setDmSelectedProperties] = useState({});
  const [filteredAssets, setFilteredAssets] = useState({});


  const getFilteredAssets = async() => {
    try{
      const response = await fetch(`http://localhost:3000/api/assets/${teamId}`, {});
      const result = await response.json();
      setFilteredAssets(result);
      console.log(result);
    }catch(err){
      console.log(err);
    }
  }

  const updateCharacterProperty = async(characterId, property, change) => {
    try{
      setCharacterData((prevData) => 
        prevData.map((char) => 
          char.id === characterId 
      ? { ...char, [property]: char[property] + change }
    : char));

      socket.emit('updateCharacterProperty', { characterId, property, change });
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on("updateCharacterData", (updatedCharacter) => {
        setCharacterData((prevData) =>
          prevData.map((char) =>
            char.id === updatedCharacter.id ? updatedCharacter : char
          )
        );
      });
      socket.on("updateSharedAssets", (updatedAssets) => {
        setFilteredAssets(updatedAssets);
      });
      socket.on("updateEnemyData", (updatedEnemy) => {
        setEnemyData((prevData) =>
          prevData.map((enemy) =>
            enemy.Enemy === updatedEnemy.Enemy ? updatedEnemy : enemy
          )
        );
      });
      socket.on("updateUserData", (updatedUser) => {
        setUserData((prevData) =>
          prevData.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );
      });
      socket.on("updateCharacterProperty", ({ characterId, property, value }) => {
        setCharacterData((prevData) =>
          prevData.map((char) =>
            char.id === characterId
              ? { ...char, [property]: value }
              : char
          )
        );
      });
    }
    return () => {
      if (socket) {
        socket.off("updateCharacterData");
        socket.off("updateEnemyData");
        socket.off("updateUserData");
        socket.off("updateCharacterProperty");
        socket.off("updateSharedAssets");
      }
    };
  }, [socket]);

  //this is for setting the original props to local state on the first mount. 
  useEffect(() => {
    setCharacterData(characters || []);
    setEnemyData(enemies || []);
    setUserData(users || []);
  }, [characters, enemies, users])

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <div>
          <h2>Inventory</h2>
          <ul>
            {characterData.items &&
              characterData.items.map((item, index) => (
                <li key={index}>
                  {item.Description || "Unnamed Asset"} - {item.Image}
                </li>
              ))}
          </ul>
        </div>
      );
        case "stats":
          return (
            <div>
              <h2>Character Stats</h2>
              <div className="character-grid">
                {characterData.map((character, index) => (
                  <div key={index} className="character-card">
                    <h3>{character.characterName}</h3>
                    <div className="character-details-grid">
                      <div className="detail">
                        <strong>Class:</strong>
                        <span>{character.characterClass}</span>
                      </div>
                      <div className="detail">
                        <strong>Level:</strong>
                        <span>{character.level}</span>
                        <button id="level-btn" onClick={() => updateCharacterProperty(character.id, "level", 1)}>Level up</button>
                      </div>
                      <div className="detail">
                        <strong>Status Points:</strong>
                        <span>{character.statusPoints}</span>
                        <div id="status-div">
                        <button id="status-btn" onClick={() => updateCharacterProperty(character.id, "statusPoints", -1)}>-1</button>
                        <button id="status-btn" onClick={() => updateCharacterProperty(character.id, "statusPoints", 1)}>+1</button>
                        </div>
                      </div>
                      <div className="detail">
                        <strong>Attack Roll:</strong>
                        <span>{character.attackRoll}</span>
                      </div>
                      <div className="detail attributes">
                        <strong>Attributes:</strong>
                        <div className="attributes-grid">
                          {Object.entries(character.attributes).map(([key, value]) => (
                            <div key={key} className="attribute">
                              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="detail">
                        <strong>Saving Throws:</strong>
                        <span>{character.savingThrows.join(", ")}</span>
                      </div>
                      <div className="detail">
                        <strong>Skills:</strong>
                        <span>{character.skills.join(", ")}</span>
                      </div>
                      <div className="detail">
                        <strong>Single-Use Skills:</strong>
                        <span>{character.singleUseSkill.join(", ")}</span>
                      </div>
                      <div className="detail">
                        <strong>Catch Phrases:</strong>
                        <span>{character.catchPhrases.join(" | ")}</span>
                      </div>
                      {
                        userId === character.userId ?
                      <div>
                      <div className="detail">
                        <strong>Flaws:</strong>
                        <span>{character.flaws}</span>
                      </div>
                      <div className="detail">
                        <strong>Ideals:</strong>
                        <span>{character.ideals}</span>
                      </div>
                      <div className="detail">
                        <strong>Notes:</strong>
                        <span>{character.notes}</span>
                      </div>
                      </div> 
                      : 
                      <div>
                      <div className="detail">
                      <strong>Flaws:</strong>
                      <span>Hidden</span>
                    </div>
                    <div className="detail">
                      <strong>Ideals:</strong>
                      <span>Hidden</span>
                    </div>
                    <div className="detail">
                      <strong>Notes:</strong>
                      <span>Hidden</span>
                    </div> 
                    </div>
                        
                      }
                      <div className="detail">
                        <strong>Image:</strong>
                        <span>
                          <img
                            src={character.image}
                            alt={character.characterName}
                            style={{ maxWidth: "100px", maxHeight: "100px" }}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        
      case "enemies":
        return (
          <div>
      <h2>Enemies</h2>
      <div className="enemy-grid">
        {enemyData.map((enemy, index) => (
          <div key={index} className="enemy-card">
            <h3>{enemy.Name}</h3>
            <div className="enemy-details-grid">
              <div className="detail">
                <strong>Armor Class:</strong>
                <span>{enemy["Armor class"]}</span>
              </div>
              <div className="detail">
                <strong>Hit Points:</strong>
                <span>{enemy["Hit Points"]}</span>
              </div>
              <div id="stat-box">

              <div className="detail">
                <strong>Speed:</strong>
                <span>{enemy.Speed}</span>
              </div>
              <div className="detail">
                <strong>Strength:</strong>
                <span>{enemy.St}</span>
              </div>
              <div className="detail">
                <strong>Dexterity:</strong>
                <span>{enemy.Dex}</span>
              </div>
              <div className="detail">
                <strong>Constitution:</strong>
                <span>{enemy.Con}</span>
              </div>
              <div className="detail">
                <strong>Intelligence:</strong>
                <span>{enemy.Int}</span>
              </div>
              <div className="detail">
                <strong>Wisdom:</strong>
                <span>{enemy.Wis}</span>
              </div>
              <div className="detail">
                <strong>Charisma:</strong>
                <span>{enemy.Cha}</span>
              </div>
              </div>
              <div className="detail">
                <strong>Description:</strong>
                <span>{enemy.Description}</span>
              </div>
              <div className="detail">
                <strong>Attack Action 1:</strong>
                <span>{enemy["attack action 1"]}</span>
                <span>{enemy["description 1"]}</span>
              </div>
              <div className="detail">
                <strong>Attack Action 2:</strong>
                <span>{enemy["attack action 2"]}</span>
                <span>{enemy["description 2"]}</span>
              </div>
              <div className="detail">
                <strong>Attack Action 3:</strong>
                <span>{enemy["attack action 3"]}</span>
                <span>{enemy["description 3"]}</span>
              </div>
              <div className="detail">
                <strong>Damage Immunities:</strong>
                <span>{enemy["damage immunities"]}</span>
              </div>
              <img src={enemy.Image} />
            </div>
          </div>
        ))}
      </div>
    </div>
        );
      case "teamStats":
        return (
          <div>
            <h2>Teamates</h2>
            <ul>
              {userData.map((user) => (
                <li key={user.id}>
                  {user.username} - {user.isAdmin ? "Admin" : "Player"}
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return <div>Invalid Tab</div>;
    }
  };

  return (
    <div>
      {isDm && <DmUi teamId={teamId} assets={assets} socket={socket}/>}
      <div className="tabs">
        <button
          onClick={() => setActiveTab("inventory")}
          className={activeTab === "inventory" ? "active" : ""}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={activeTab === "stats" ? "active" : ""}
        >
          Character Stats
        </button>
        <button
          onClick={() => setActiveTab("enemies")}
          className={activeTab === "enemies" ? "active" : ""}
        >
          Enemies
        </button>
        <button
          onClick={() => setActiveTab("teamStats")}
          className={activeTab === "teamStats" ? "active" : ""}
        >
          Teamates
        </button>
      </div>
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default TabSwitcher;
