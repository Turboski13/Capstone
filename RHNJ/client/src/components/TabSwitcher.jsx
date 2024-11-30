import React, { useState } from "react";
import './TabSwitcher.css';

const TabSwitcher = ({ teamName, dmId, assets, characters, enemies, users }) => {
  const [activeTab, setActiveTab] = useState("inventory");

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <div>
            <h2>Inventory</h2>
            <ul>
              {characters.items && (
                characters.items.map((item, index) => (
                  <li key={index}>
                  {item.Description || "Unnamed Asset"} - {item.Image}
                </li>
                )
              ))}
            </ul>
          </div>
        );
        case "stats":
          return (
            <div>
              <h2>Character Stats</h2>
              <div className="character-grid">
                {characters.map((character, index) => (
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
                      </div>
                      <div className="detail">
                        <strong>Status Points:</strong>
                        <span>{character.statusPoints}</span>
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
        {enemies.map((enemy, index) => (
          <div key={index} className="enemy-card">
            <h3>{enemy.Enemy}</h3>
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
                <span>{enemy.Strength}</span>
              </div>
              <div className="detail">
                <strong>Dexterity:</strong>
                <span>{enemy.Dexterity}</span>
              </div>
              <div className="detail">
                <strong>Constitution:</strong>
                <span>{enemy.Constitution}</span>
              </div>
              <div className="detail">
                <strong>Intelligence:</strong>
                <span>{enemy.Intelligence}</span>
              </div>
              <div className="detail">
                <strong>Wisdom:</strong>
                <span>{enemy.Wisdom}</span>
              </div>
              <div className="detail">
                <strong>Charisma:</strong>
                <span>{enemy.Charisma}</span>
              </div>
              </div>
              <div className="detail">
                <strong>Description:</strong>
                <span>{enemy.Description}</span>
              </div>
              <div className="detail">
                <strong>Attack Action 1:</strong>
                <span>{enemy["attack action 1"]}</span>
              </div>
              <div className="detail">
                <strong>Attack Action 2:</strong>
                <span>{enemy["attack action 2"]}</span>
              </div>
              <div className="detail">
                <strong>Damage Immunities:</strong>
                <span>{enemy["damage immunities"]}</span>
              </div>
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
              {users.map((user) => (
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
