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
    try {
      const response = await fetch('http://localhost:3000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.token) {
        console.log('Setting token in localStorage:', data.token);
        // Store the token in localStorage
        localStorage.setItem('authToken', data.token);

        // Redirect to admin home
        navigate('/admin-home');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong!');
    } finally {
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
