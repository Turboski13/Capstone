// client/src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      localStorage.setItem('token', response.data.token);
      console.log('Login successful:', response.data);
      navigate('/player-home');  // Redirect to home or another page
    } catch (error) {
      console.error('Login failed:', error.response.data);
    }
  };

  return (
    <div className="login-page">
      <div className="form">
    <form className="login-form" onSubmit={handleLogin}>
      <div className="user-box">
      <input
        type='text'
        placeholder='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      </div>
      <div className="user-box">
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      </div>
      <button type='submit'>Log In</button>
      </form>
    </div>
    </div>
  );
};

export default Login;