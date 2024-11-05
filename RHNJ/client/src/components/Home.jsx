/* the components need to be named with capitol letters to be recognized as components.  */
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../index.css';

function Home() {
  return (
    <div className='home-container'>
      <nav>
        <div className='nav-left'>
          <ul>
            <li>
              <Link to='/about' className='navtext'>
                About
              </Link>
            </li>
            <li>
              <Link to='/how-to-play' className='navtext'>
                How to Play
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
              <Link to='/login' className='navtext2'>
                Login
              </Link>
            </li>
            <li>
              <Link to='/signup' className='navtext2'>
                Signup
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className='admin-login-container'>
        <Link to='/admin-login' className='navtext3'>
          Admin Login
        </Link>
      </div>
    </div>
  );
}
export default Home;