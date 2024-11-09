import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import AboutCharacters from './components/AboutCharacters';
import AdminHome from './pages/adminHome';
import DMHome from './pages/dmHome';
import PlayerHome from './pages/playerHome';
import Navigations from './components/Navigations';
import Home from './components/Home';
import About from './components/About';
import HowToPlay from './components/HowToPlay';
import AdminLogin from './components/AdminLogin';
import DmSignUp from './components/DmSignUp';
import characters from './utils/characterList';
import CharacterDetail from './components/CharacterDetail';
import UserCharacter from './components/UserCharacter';
import './index.css';

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navigations /> {/* This renders the navigation bar globally */}
      <Routes>
        {/* Public Routes */}
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/how-to-play' element={<HowToPlay />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/dm-signup' element={<DmSignUp />} />
        <Route
          path='/about-characters'
          element={<AboutCharacters characters={characters} />}
        />
        <Route path='/user/character/:id' element={<UserCharacter />} />
        <Route path='/characters' element={<characterList />} />
        <Route path='/character/:id' element={<CharacterDetail />} />
        <Route path='/' element={<Home />} /> {/* Home route */}
        {/* Protected Routes */}
        <Route
          path='/admin-home'
          element={isAuthenticated() ? <Navigate to='/login' /> : <AdminHome />}
        />
        <Route
          path='/dm-home'
          element={isAuthenticated() ? <Navigate to='/login' /> : <DMHome />}
        />
        <Route
          path='/player-home'
          element={
            isAuthenticated() ? <Navigate to='/login' /> : <PlayerHome />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
