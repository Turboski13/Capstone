import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../index.css';

function Home() {
  return (
    <div className='home-container'>
      {/* <h1>Welcome to the Game</h1>
      <p>
        This is the home page where players can learn about the game and get
        started!
      </p> */}

      <div className='admin-login-container'>
        <Link to='/admin-login' className='navtext3'>
          Admin Login
        </Link>
      </div>
    </div>
  );
}

export default Home;
