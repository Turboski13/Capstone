import React, { useEffect, useState } from 'react';
import {
  searchAllUsers,
  // searchAllCharacters,
} from '../functions/userFunctions';
import { deleteUser, editUser } from '../functions/adminFunctions';

const AdministratorHome = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({ username: '', password: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await searchAllUsers();
        setUsers(allUsers);
      } catch (err) {
        setError('Failed to fetch users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
      <h2>Administrator Home</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type='text'
        placeholder='Search users...'
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <h3>User List</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan='2'>No users found.</td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                {editingUserId === user.id ? (
                  <td colSpan='2'>
                    <form onSubmit={handleEditSubmit}>
                      <input
                        type='text'
                        name='username'
                        value={editedUser.username}
                        onChange={handleEditChange}
                        placeholder='Username'
                      />
                      <input
                        type='password'
                        name='password'
                        value={editedUser.password}
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
                    <td>{user.username}</td>
                    <td>
                      <button onClick={() => handleEditClick(user)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdministratorHome;
