// client/src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      
      localStorage.setItem('token', response.token);
      console.log('Token immediately after set:', localStorage.getItem('token'));
      setTimeout(() => {
        navigate('/player-home'); // Redirect to player home
      }, 100);
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data
        : 'Login failed. Please check your credentials.';
      console.error('Login failed:', errorMessage);
    }
  };

  return (
    <div className='login-page'>
      <Navigations />

      <div className='form'>
        <div className='card-container'>
          <h2 className='admin-login-h2'>Login</h2>
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
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
