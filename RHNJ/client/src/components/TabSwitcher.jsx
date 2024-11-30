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
            <h2>Team Character Stats</h2>
            {characters.map((character, index) => (
              <div key={index}>
                <h3>{character.characterName}</h3>
                <pre>{JSON.stringify(character.attributes, null, 2)}</pre>
              </div>
            ))}
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
