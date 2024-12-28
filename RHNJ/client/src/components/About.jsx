import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navigations from './Navigations';
import './About.css';

export default function About() {
  return (
    <div className='about-us'>
      <Navigations />
      <h1 className='about-h1'>About Us</h1>
      <h2 className='about-h2'>The Game</h2>
      <p className='abt-p'>
        Dungeons and Divas was created as a gift for Jessica's sister. It was
        made with love and audacity and lives in the crossroads of nerdom and
        reality tv.
      </p>
      <h2 className='about-h2'>The Creators</h2>
      <h3 className='about-h3'>Jessica Lafferty</h3>
      <p className='abt-p'>
        Jessica is a programmer who runs mostly on caffeine and believes that
        hard times and poor life choices make for good stories.
      </p>
      <Link
        to='https://www.linkedin.com/in/jessica-lafferty-902155107/'
        className='linkedin'
      >
        Jessica's LinkedIn
      </Link>
      <h3 className='about-h3'>Katherine Arambulo</h3>
      <p className='abt-p'>
        tKatherine is a Healthcare Professional with a severe caffeine
        addiction, hence, she is working to become a software developer.
      </p>
      <Link
        to='https://www.linkedin.com/in/katherinejoey/'
        className='linkedin'
      >
        Katherine's LinkedIn
      </Link>
      <h2 className='about-h2'>Special Thank you to:</h2>
      <h3 className='about-h3'>Ari Pine</h3>
      <p className='abt-p'>
        Thank you Ari, for helping us to fix everything we kept on breaking with
        this game.
      </p>
      <Link
        to='https://www.linkedin.com/in/ari-pine-71684019a/'
        className='linkedin'
      >
        Ari's LinkedIn
      </Link>
    </div>
  );
}
