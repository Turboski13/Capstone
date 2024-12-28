import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  searchSingleUserCharacter,
  editUserCharacter,
} from '../functions/userFunctions';
import '../index.css';
import { Link, useNavigate } from 'react-router-dom';
import Navigations from '../components/Navigations';
import './UserCharacter.css';

const UserCharacter = () => {
  const { id } = useParams();
  // console.log('Fetched teamId from URL:', teamId);
  const [characterInfo, setCharacterInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const getCharacters = async (id) => {
    const response = await searchSingleUserCharacter(id);
    setCharacterInfo(response);
    setEditData(response.character);
  };

  useEffect(() => {
    getCharacters(id);
  }, [id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name in editData.attributes) {
      setEditData((prevState) => ({
        ...prevState,
        attributes: {
          ...prevState.attributes,
          [name]: value,
        },
      }));
    } else {
      setEditData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedCharacter = await editUserCharacter(id, editData);
      setCharacterInfo({ ...characterInfo, character: updatedCharacter });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update character:', error);
    }
  };

  return (
    <div className='player-home'>
      <Navigations />

      {characterInfo && (
        <div className='character-stats'>
          <h1 className='charc-name'>
            {isEditing
              ? 'Edit Character'
              : characterInfo.character?.characterName}
          </h1>

          {isEditing ? (
            <div className='form-field'>
              <div className='form-field'>
                <label>Character Name:</label>
                <input
                  type='text'
                  name='characterName'
                  value={editData.characterName}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Character Level:</label>
                <input
                  type='number'
                  name='level'
                  value={editData.level}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Strength:</label>
                <input
                  type='number'
                  name='strength'
                  value={editData.attributes.strength}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Dexterity:</label>
                <input
                  type='number'
                  name='dexterity'
                  value={editData.attributes.dexterity}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Constitution:</label>
                <input
                  type='number'
                  name='constitution'
                  value={editData.attributes.constitution}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Intelligence:</label>
                <input
                  type='number'
                  name='intelligence'
                  value={editData.attributes.intelligence}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Wisdom:</label>
                <input
                  type='number'
                  name='wisdom'
                  value={editData.attributes.wisdom}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Charisma:</label>
                <input
                  type='number'
                  name='charisma'
                  value={editData.attributes.charisma}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Ideals:</label>
                <input
                  type='text'
                  name='ideals'
                  value={editData.ideals}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Flaws:</label>
                <input
                  type='text'
                  name='flaws'
                  value={editData.flaws}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <div className='form-field'>
                <label>Notes:</label>
                <input
                  type='text'
                  name='notes'
                  value={editData.notes}
                  onChange={handleEditChange}
                  className='uc-form'
                />
              </div>
              <button onClick={handleEditSubmit} className='uc-btn'>
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className='uc-btn'>
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <h3 className='uc-char-level'>
                Level: {characterInfo.character?.level}
              </h3>
              <h3 className='uc-char-sp'>
                Status Points: {characterInfo.character?.statusPoints}
              </h3>
              <h2 className='uc-char-stats'>Stats:</h2>
              <ul>
                <li>Strength: {characterInfo.character.attributes.strength}</li>
                <li>
                  Dexterity: {characterInfo.character.attributes.dexterity}
                </li>
                <li>
                  Constitution:{' '}
                  {characterInfo.character.attributes.constitution}
                </li>
                <li>
                  Intelligence:{' '}
                  {characterInfo.character.attributes.intelligence}
                </li>
                <li>Wisdom: {characterInfo.character.attributes.wisdom}</li>
                <li>Charisma: {characterInfo.character.attributes.charisma}</li>
              </ul>
              <p className='uc-char-stats'>
                Saving Throws:{' '}
                {characterInfo.character.attributes?.savingThrows?.map(
                  (save, index) => (
                    <span key={index}>
                      {save}
                      {index <
                      characterInfo.character.attributes.savingThrows.length - 1
                        ? ', '
                        : ''}
                    </span>
                  )
                )}
              </p>

              <p className='char-txt'>
                Skills:{' '}
                {characterInfo.character.skills?.map((skill, index) => (
                  <span key={index}>
                    {skill}
                    {index < characterInfo.character.skills.length - 1
                      ? ', '
                      : ''}
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

              <p className='char-txt'>
                Attack Roll: {characterInfo.character.attackRoll}
              </p>
              <h3 className='uc-char-stats'>
                Ideals: {characterInfo.character.ideals}
              </h3>
              <h3 className='uc-char-stats'>
                Flaws: {characterInfo.character.flaws}
              </h3>
              <h3 className='uc-char-stats'>
                Notes: {characterInfo.character.notes}
              </h3>

              <button
                onClick={() => setIsEditing(true)}
                className='uc-edit-btn'
              >
                Edit
              </button>
            </div>
          )}
          <div>
            <Link to='/player-home' className='uc-char-link'>
              Back to Player Homepage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCharacter;
