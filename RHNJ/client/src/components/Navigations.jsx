import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useLocation to detect current path
import { logout } from "../api";

const Navigations = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // State for managing logged-in status 
  const navigate = useNavigate();  
  // Check if token exists in localStorage and set the state when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");  
    setIsLoggedIn(token !== null);  // Set isLoggedIn state based on whether token exists
  }, []);  // Empty dependency array ensures this effect runs only once when the component mounts

  const handleLogout = () => {
    logout();  // Call logout from API
    localStorage.removeItem("token");  // Remove token from localStorage
    setIsLoggedIn(false);  // Update isLoggedIn state to false
    navigate("/");  // Redirect to home page after logout
  };

  return (
    <nav>
      <div className="nav-left">
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
      <Link to='/about-characters'>Characters</Link>
      <Link to='/player-home'>Player Home</Link>
      <Link to="/dm-home">Join a game</Link>

      <div className="nav-right">
        <ul>
          {isLoggedIn ? (
            <li>
              <button onClick={handleLogout} className="navtext2">
                Logout
              </button>
            </li>
          ) : (
            <>
            <Link to='/login'>Login</Link> 
            <Link to='/signup'>Sign Up!</Link>
            </>)}
      </ul>
      </div>
      </div>
    </nav>
  );
};

export default Navigations;