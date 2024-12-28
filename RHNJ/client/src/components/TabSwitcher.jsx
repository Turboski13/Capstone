import React, { useState, useEffect } from 'react';
import './TabSwitcher.css';
import DmUi from './DmUi';
import DiceRoller from './DiceRoller';

const TabSwitcher = ({
  selectedAbility,
  setSelectedAbility,
  teamId,
  userId,
  isDm,
  teamName,
  dmId,
  assets,
  characters,
  enemies,
  users,
  socket,
}) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [characterData, setCharacterData] = useState(characters);
  const [enemyData, setEnemyData] = useState();
  const [userData, setUserData] = useState(users);
  const [filteredAssets, setFilteredAssets] = useState({});
  const [myAbilities, setMyAbilities] = useState({});

  const getFilteredAssets = async (teamId) => {
    const token = localStorage.getItem('token');
    try {
      // const response = await fetch(`http://localhost:3000/api/assets/${teamId}`, {
      const response = await fetch(
        `https://capstone-dk9v.onrender.com/api/assets/${teamId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      setFilteredAssets((prev) => ({ ...prev, result }));
      const enemyArray = result.filter(
        (asset) =>
          (asset.type === 'Enemy' || asset.type === 'Boss') &&
          asset.properties.Name
      );
      const abilities = result.filter((asset) => asset.type === 'ability');
      console.log('enem: ', enemies);
      setEnemyData(enemyArray);
      setUserAbilities(userId, abilities);
    } catch (err) {
      console.log(err);
    }
  };

  const setUserAbilities = (userId, abilities) => {
    const myChar = characterData.filter((char) => char.userId === userId);
    const myClass = myChar[0].characterClass;
    console.log('CLASS: ', myClass);
    console.log('ABILITIES: ', abilities);
    const filteredAbilities = abilities.filter((ability) =>
      myClass.includes(ability.properties.Class)
    );
    setMyAbilities(filteredAbilities);
  };

  const updateCharacterProperty = async (characterId, property, change) => {
    try {
      setCharacterData((prevData) =>
        prevData.map((char) =>
          char.id === characterId
            ? { ...char, [property]: char[property] + change }
            : char
        )
      );

      socket.emit('updateCharacterProperty', { characterId, property, change });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('updateCharacterData', (updatedCharacter) => {
        setCharacterData((prevData) =>
          prevData.map((char) =>
            char.id === updatedCharacter.id ? updatedCharacter : char
          )
        );
      });
      socket.on('updateSharedAssets', (updatedAssets) => {
        // Filter the enemies directly from updatedAssets before setting state
        const enemyTypes = updatedAssets?.filter(
          (asset) =>
            (asset.type === 'Enemy' || asset.type === 'Boss') &&
            asset.properties.Name
        );

        // Set filtered assets and enemy data
        setFilteredAssets(updatedAssets);
        setEnemyData(enemyTypes);
        console.log('FILTERED:', updatedAssets);
      });

      socket.on('updateEnemyData', (updatedEnemy) => {
        setEnemyData((prevData) =>
          prevData.map((enemy) =>
            enemy.Enemy === updatedEnemy.Enemy ? updatedEnemy : enemy
          )
        );
      });
      socket.on('updateUserData', (updatedUser) => {
        setUserData((prevData) =>
          prevData.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );
      });
      socket.on(
        'updateCharacterProperty',
        ({ characterId, property, value }) => {
          setCharacterData((prevData) =>
            prevData.map((char) =>
              char.id === characterId ? { ...char, [property]: value } : char
            )
          );
        }
      );
    }
    return () => {
      if (socket) {
        socket.off('updateCharacterData');
        socket.off('updateEnemyData');
        socket.off('updateUserData');
        socket.off('updateCharacterProperty');
        socket.off('updateSharedAssets');
      }
    };
  }, [socket]);

  //this is for setting the original props to local state on the first mount.
  useEffect(() => {
    setCharacterData(characters || []);
    // setEnemyData(enemies || []);
    setUserData(users || []);
    getFilteredAssets(teamId);
  }, [characters, users]);

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div>
            <h2>Inventory</h2>
            <ul>
              {characterData.items &&
                characterData.items.map((item, index) => (
                  <li key={index}>
                    {item.Description || 'Unnamed Asset'} - {item.Image}
                  </li>
                ))}
            </ul>
          </div>
        );
      case 'dice':
        return (
          <div className='dice-comp'>
            <DiceRoller />
          </div>
        );
      case 'stats':
        return (
          <div>
            <h2>Character Stats</h2>
            <div className='character-grid'>
              {characterData.map((character, index) => (
                <div key={index} className='character-card'>
                  <h3>{character.characterName}</h3>
                  <div className='character-details-grid'>
                    <div className='detail'>
                      <strong>Class:</strong>
                      <span>{character.characterClass}</span>
                    </div>
                    <div className='detail'>
                      <strong>Level:</strong>
                      <span>{character.level}</span>
                      <button
                        id='level-btn'
                        onClick={() =>
                          updateCharacterProperty(character.id, 'level', 1)
                        }
                      >
                        Level up
                      </button>
                    </div>
                    <div className='detail'>
                      <strong>Status Points:</strong>
                      <span>{character.statusPoints}</span>
                      <div id='status-div'>
                        <button
                          id='status-btn'
                          onClick={() =>
                            updateCharacterProperty(
                              character.id,
                              'statusPoints',
                              -1
                            )
                          }
                        >
                          -1
                        </button>
                        <button
                          id='status-btn'
                          onClick={() =>
                            updateCharacterProperty(
                              character.id,
                              'statusPoints',
                              1
                            )
                          }
                        >
                          +1
                        </button>
                      </div>
                    </div>
                    <div className='detail'>
                      <strong>Attack Roll:</strong>
                      <span>{character.attackRoll}</span>
                    </div>
                    <div className='detail attributes'>
                      <strong>Attributes:</strong>
                      <div className='attributes-grid'>
                        {Object.entries(character.attributes).map(
                          ([key, value]) => (
                            <div key={key} className='attribute'>
                              <strong>
                                {key.charAt(0).toUpperCase() + key.slice(1)}:
                              </strong>
                              <span>{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className='detail'>
                      <strong>Saving Throws:</strong>
                      <span>{character.savingThrows.join(', ')}</span>
                    </div>
                    <div className='detail'>
                      <strong>Skills:</strong>
                      <span>{character.skills.join(', ')}</span>
                    </div>
                    <div className='detail'>
                      <strong>Single-Use Skills:</strong>
                      <span>{character.singleUseSkill.join(', ')}</span>
                    </div>
                    <div className='detail'>
                      <strong>Catch Phrases:</strong>
                      <span>{character.catchPhrases.join(' | ')}</span>
                    </div>
                    {userId === character.userId ? (
                      <div>
                        <div className='detail'>
                          <strong>Flaws:</strong>
                          <span>{character.flaws}</span>
                        </div>
                        <div className='detail'>
                          <strong>Ideals:</strong>
                          <span>{character.ideals}</span>
                        </div>
                        <div className='detail'>
                          <strong>Notes:</strong>
                          <span>{character.notes}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='detail'>
                          <strong>Flaws:</strong>
                          <span>Hidden</span>
                        </div>
                        <div className='detail'>
                          <strong>Ideals:</strong>
                          <span>Hidden</span>
                        </div>
                        <div className='detail'>
                          <strong>Notes:</strong>
                          <span>Hidden</span>
                        </div>
                      </div>
                    )}
                    <div className='detail'>
                      <strong>Image:</strong>
                      <span>
                        <img
                          src={character.image}
                          alt={character.characterName}
                          style={{ maxWidth: '100px', maxHeight: '100px' }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'abilities':
        return (
          <div>
            <h2>Abilities</h2>
            <div className='enemy-grid'>
              {myAbilities.map((ability) => (
                <div key={ability.id}>
                  <button
                    className='enemy-card'
                    onClick={() => setSelectedAbility(ability.id)}
                  >
                    <h3>{ability.properties.Name}</h3>
                    <div className='attributes-grid'>
                      <div className='detail'>
                        <strong>Damage: </strong>
                        <span>{ability.properties.Damage}</span>
                      </div>
                      <div className='detail'>
                        <strong>Stat Needed To Succeed: </strong>
                        <span>{ability.properties.StatToSucceed}</span>
                      </div>
                      <div className='detail'>
                        <strong>Enemy Defense Stat: </strong>
                        <span>{ability.properties.EnemyDefendStat}</span>
                      </div>
                      <div className='detail'>
                        <strong>Healing:</strong>
                        <span>{ability.properties.Healing}</span>
                      </div>
                      <div className='detail'>
                        <strong>Cast Per Rest: </strong>
                        <span>{ability.properties.CastPerRest}</span>
                      </div>
                    </div>
                    <div className='detail'>
                      <strong>Description: </strong>
                      <span>{ability.properties.Description}</span>
                    </div>
                    <div className='detail'>
                      <strong>Notes:</strong>
                      <span>{ability.properties.Notes}</span>
                    </div>
                    <span>
                      <img
                        src={ability.properties.Image}
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                        alt={`${ability.properties.Name} notes: ${ability.properties.Notes}`}
                      />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'enemies':
        return (
          <div>
            <h2>Enemies</h2>
            <div className='enemy-grid'>
              {enemyData.map((enemy) => (
                <div key={enemy.id} className='enemy-card'>
                  <h3>{enemy.properties?.Name}</h3>
                  <div className='enemy-details-grid'>
                    <div className='detail'>
                      <strong>Armor Class:</strong>
                      <span>{enemy.properties['Armor class']}</span>
                    </div>
                    <div className='detail'>
                      <strong>Hit Points:</strong>
                      <span>{enemy.properties['Hit Points']}</span>
                    </div>
                    <div id='stat-box'>
                      <div className='detail'>
                        <strong>Speed:</strong>
                        <span>{enemy.properties?.Speed}</span>
                      </div>
                      <div className='detail'>
                        <strong>Strength:</strong>
                        <span>{enemy.properties?.St}</span>
                      </div>
                      <div className='detail'>
                        <strong>Dexterity:</strong>
                        <span>{enemy.properties?.Dex}</span>
                      </div>
                      <div className='detail'>
                        <strong>Constitution:</strong>
                        <span>{enemy.properties?.Con}</span>
                      </div>
                      <div className='detail'>
                        <strong>Intelligence:</strong>
                        <span>{enemy.properties?.Int}</span>
                      </div>
                      <div className='detail'>
                        <strong>Wisdom:</strong>
                        <span>{enemy.properties?.Wis}</span>
                      </div>
                      <div className='detail'>
                        <strong>Charisma:</strong>
                        <span>{enemy.properties?.Cha}</span>
                      </div>
                    </div>
                    <div className='detail'>
                      <strong>Description:</strong>
                      <span>{enemy.properties?.Description}</span>
                    </div>
                    <div className='detail'>
                      <strong>Attack Action 1:</strong>
                      <span>{enemy.properties['attack action 1']}</span>
                      <span>{enemy.properties['description 1']}</span>
                    </div>
                    <div className='detail'>
                      <strong>Attack Action 2:</strong>
                      <span>{enemy.properties['attack action 2']}</span>
                      <span>{enemy.properties['description 2']}</span>
                    </div>
                    <div className='detail'>
                      <strong>Attack Action 3:</strong>
                      <span>{enemy.properties['attack action 3']}</span>
                      <span>{enemy.properties['description 3']}</span>
                    </div>
                    <div className='detail'>
                      <strong>Damage Immunities:</strong>
                      <span>{enemy.properties['damage immunities']}</span>
                    </div>
                    <img src={enemy.properties.Image} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'teamStats':
        return (
          <div>
            <h2>Teammates</h2>
            <ul>
              {userData.map((user) => (
                <li key={user.id}>
                  {user.username} - {user.isAdmin ? 'Admin' : 'Player'}
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
      {isDm && <DmUi teamId={teamId} assets={assets} socket={socket} />}
      <div className='tabs'>
        <button
          onClick={() => setActiveTab('dice')}
          className={activeTab === 'dice' ? 'active' : ''}
        >
          Dice Roll
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={activeTab === 'inventory' ? 'active' : ''}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={activeTab === 'stats' ? 'active' : ''}
        >
          Character Stats
        </button>
        <button
          onClick={() => setActiveTab('enemies')}
          className={activeTab === 'enemies' ? 'active' : ''}
        >
          Enemies
        </button>
        <button
          onClick={() => setActiveTab('abilities')}
          className={activeTab === 'abilities' ? 'active' : ''}
        >
          Abilities
        </button>
        <button
          onClick={() => setActiveTab('teamStats')}
          className={activeTab === 'teamStats' ? 'active' : ''}
        >
          Teammates
        </button>
      </div>
      <div className='tab-content'>{renderContent()}</div>
    </div>
  );
};

export default TabSwitcher;
