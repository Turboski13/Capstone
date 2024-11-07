import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  searchAllUsers,
  searchAllUserCharacters,
} from '../functions/userFunctions';
import { deleteUser, editUser } from '../functions/adminFunctions';
import Navigations from '../components/Navigations';

const AdminHome = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({ username: '', password: '' });
  const [userCharacters, setUserCharacters] = useState([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [errorCharacters, setErrorCharacters] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token);

    if (!token) {
      navigate('/admin-login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError('Unable to fetch user data. Please log in again.');
        localStorage.removeItem('authToken');
        navigate('/admin-login');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } catch (err) {
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditedUser({ username: user.username, password: '' }); // Clear password field for editing
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await editUser(editingUserId, editedUser);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUserId
            ? { ...user, username: editedUser.username }
            : user
        )
      );
      setEditingUserId(null); // Reset editing state
      setEditedUser({ username: '', password: '' }); // Clear edited user
    } catch (err) {
      setError('Failed to update user. Please try again.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewUserCharacters = async (userId) => {
    setLoadingCharacters(true);
    setErrorCharacters(null); // Reset error state

    try {
      const characters = await searchAllUserCharacters(userId);
      setUserCharacters(characters);
    } catch (err) {
      setErrorCharacters('Failed to fetch characters for this user.');
    } finally {
      setLoadingCharacters(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div className='dm-home'>
      <Navigations />

      <h2>Administrator Home</h2>
      <p>Welcome, you are now logged in as Admin!</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type='text'
        placeholder='Search users...'
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <h3 className='admin-h3'>User List</h3>
      <table className='admin-table'>
        <thead>
          <tr>
            <th className='admin-th'>Username</th>
            <th className='admin-th'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan='2'>No users found.</td>
            </tr>
          ) : (
            filteredUsers?.map((user) => (
              <tr key={user?.id}>
                {editingUserId === user?.id ? (
                  <td colSpan='2'>
                    <form onSubmit={handleEditSubmit}>
                      <input
                        type='text'
                        name='username'
                        value={editedUser?.username || ''}
                        onChange={handleEditChange}
                        placeholder='Username'
                      />
                      <input
                        type='password'
                        name='password'
                        value={editedUser?.password || ''}
                        onChange={handleEditChange}
                        placeholder='Password (leave blank if unchanged)'
                      />
                      <button type='submit'>Save</button>
                      <button
                        type='button'
                        onClick={() => setEditingUserId(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td>{user?.username}</td>
                    <td>
                      <button onClick={() => handleEditClick(user)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(user?.id)}>
                        Delete
                      </button>
                      <button
                        onClick={() => handleViewUserCharacters(user?.id)}
                      >
                        View Characters
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {userCharacters?.length > 0 && (
        <div>
          <h3>
            Characters for{' '}
            {filteredUsers?.find(
              (user) => user?.id === userCharacters[0]?.userId
            )?.username || 'Unknown User'}
          </h3>
          {loadingCharacters ? (
            <p>Loading characters...</p>
          ) : errorCharacters ? (
            <p style={{ color: 'red' }}>{errorCharacters}</p>
          ) : (
            <ul>
              {userCharacters?.map((character) => (
                <li key={character?.id}>
                  {character?.name} - {character?.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHome;
