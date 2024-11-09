// client/src/components/navigations.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api';

const Navigations = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function
    navigate('/login'); // Redirect to the login page
  };

  return (
    <nav>
      <div className='nav-left1'>
        <ul>
          <li>
            <Link to='/' className='navtext'>
              Home
            </Link>
          </li>
          <li>
            <Link to='/about' className='navtext'>
              About
            </Link>
          </li>
          <li>
            <Link to='/how-to-play' className='navtext'>
              How To Play
            </Link>
          </li>
          <li>
            <Link to='/about-characters' className='navtext'>
              Characters
            </Link>
          </li>
        </ul>
      </div>
      <div className='nav-right'>
        <ul>
          <li>
            <Link to='/dm-home' className='navtext'>
              DM Page
            </Link>
          </li>
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
          <li>
            <button onClick={handleLogout} className='navtext2'>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigations;
