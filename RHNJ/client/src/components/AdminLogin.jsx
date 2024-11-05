import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual login logic
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      // Handle successful login (e.g., redirect or store tokens)
      console.log('Login successful:', data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='admin-login-div'>
      <Navigations />

      <div className='form'>
        <div className='card-container'>
          <h2 className='admin-login-h2'>Admin Login</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form className='login-form' onSubmit={handleLogin}>
            <div className='user-box'>
              <input
                type='text'
                placeholder='Username:'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className='user-box'>
              <input
                type='password'
                placeholder='Password:'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type='submit' className='btn'>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;