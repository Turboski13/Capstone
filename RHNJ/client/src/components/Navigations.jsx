import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation to detect current path
import { logout } from '../api';

const Navigations = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation(); // Get current route

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(token !== null);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  return (
    <nav>
      <div className='nav-left'>
        <ul>
          <li>
            <Link
              to='/'
              className={`navtext ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to='/about'
              className={`navtext ${
                location.pathname === '/about' ? 'active' : ''
              }`}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to='/how-to-play'
              className={`navtext ${
                location.pathname === '/how-to-play' ? 'active' : ''
              }`}
            >
              How to Play
            </Link>
          </li>
          <li>
            <Link
              to='/about-characters'
              className={`navtext ${
                location.pathname === '/about-characters' ? 'active' : ''
              }`}
            >
              Characters
            </Link>
          </li>
        </ul>
      </div>
      <div className='nav-right'>
        <ul>

          {isLoggedIn ? (
            <li>
              <button onClick={handleLogout} className='navtext2'>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li>
                <Link to='/login' className='navtext2'>
                  Login
                </Link>
              </li>
              <li>
                <Link to='/signup' className='navtext2'>
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigations;
