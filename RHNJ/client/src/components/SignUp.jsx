// client/src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigation from './Navigations';


const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await signup({ username, password });
      console.log('Signup successful:', response);
      setUsername(response.username);
      navigate('/player-home'); // Redirect to login or another page
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message);
      alert(
        'Signup failed: ' + (error.response?.data?.error || 'An error occurred')
      );
    }
  };

  return (
    <div className='signup-page'>
      <Navigation />

      <div className='form'>
        <div className='card-container'>
          <form className='signup-form' onSubmit={handleSignup}>
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
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
