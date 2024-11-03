import React, { useEffect, useState } from 'react';
import { searchAllUsers } from '../functions/userFunctions'; // Adjust imports based on your file structure
import {
  searchSingleUser,
  editUser,
  deleteUser,
  searchAllDMs,
  searchSingleDM,
  editDM,
  deleteDM,
  searchAllCharacters,
  searchSingleCharacter,
  editCharacter,
  deleteCharacter,
} from '../functions/adminFunctions'; // Adjust imports based on your file structure

const AdministratorHome = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
      <h2>Administrator Home</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h3>User List</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdministratorHome;
