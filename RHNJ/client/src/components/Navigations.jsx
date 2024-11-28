import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useLocation to detect current path
import { logout } from "../api";

const Navigations = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // State for managing logged-in status
  const location = useLocation();  
  const navigate = useNavigate();  
  // Check if token exists in localStorage and set the state when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");  
    console.log('Token in Navigations:', token);
    setIsLoggedIn(token !== null);  // Set isLoggedIn state based on whether token exists
  }, [location.pathname]);  // Empty dependency array ensures this effect runs only once when the component mounts

  const handleLogout = () => {
    logout();  // Call logout from API
    localStorage.removeItem("token");  // Remove token from localStorage
    setIsLoggedIn(false);  // Update isLoggedIn state to false
    navigate("/");  // Redirect to home page after logout
  };

  // Helper function to render navigation links dynamically
  const renderNavLink = (to, label) => {
    return location.pathname !== to && (
      <li>
        <Link
          to={to}
          className={`navtext ${location.pathname === to ? "active" : ""}`}
        >
          {label}
        </Link>
      </li>
    );
  };

  // Check if the current page is Player Home or DM Home
  const isPlayerHome = location.pathname === "/player-home";  // Adjust to your Player Home path
  const isDMHome = location.pathname === "/dm-home";  // Adjust to your DM Home path
  const isHowToPlay = location.pathname === "/how-to-play";  // Check if current page is How to Play

  return (
    <nav>
      <div className="nav-left">
        <ul>
          {/* Conditionally render "Home", "About", "How to Play", "Characters" for non-Player Home and non-DM Home pages */}
          {!isPlayerHome && !isDMHome && renderNavLink("/", "Home")}
          {!isPlayerHome && !isDMHome && renderNavLink("/about", "About")}
          {!isPlayerHome && !isDMHome && renderNavLink("/how-to-play", "How to Play")}
          {!isPlayerHome && !isDMHome && renderNavLink("/about-characters", "Characters")}

          {/* Render specific links for Player Home page */}
          {isPlayerHome && renderNavLink("/how-to-play", "How to Play")}
          {isPlayerHome && renderNavLink("/about-characters", "Characters")}
          {isPlayerHome && renderNavLink("/player-home", "Player Home")}
          {isPlayerHome && renderNavLink("/dm-home", "DM Home")}

          {/* Render specific links for DM Home page */}
          {isDMHome && renderNavLink("/how-to-play", "How to Play")}
          {isDMHome && renderNavLink("/about-characters", "Characters")}
          {isDMHome && renderNavLink("/player-home", "Player Home")} 

          {/* If the user is logged in and on the "How to Play" page, add these links */}
          {isHowToPlay && isLoggedIn && (
            <>
              {renderNavLink("/about-characters", "Characters")}
              {renderNavLink("/player-home", "Player Home")}
              {renderNavLink("/dm-home", "DM Home")}
            </>
          )}
        </ul>
      </div>

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
              {/* Conditionally render the Login/Signup links for non-Player Home and non-DM Home */}
              {!isPlayerHome && !isDMHome && renderNavLink("/login", "Login")}
              {!isPlayerHome && !isDMHome && renderNavLink("/signup", "Signup")}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigations;