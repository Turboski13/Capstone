import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/admin-home');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Logging in with:', username, password);

    try {
      const response = await fetch('http://localhost:3000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Login successful:', data);

      if (data.token) {
        console.log('Saving token:', data.token);
        localStorage.setItem('authToken', data.token);

        setUsername('');
        setPassword('');
        setError(null);

        navigate('/admin-home');
        console.log('Navigating to /admin-home');
      } else {
        setError('Failed to get token from server');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className='admin-login-div'>
      <Navigations />

      <div className='form'>
        <div className='card-container'>
          <h2 className='admin-login-h2'>Admin Login</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <p>Loading...</p>}
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
