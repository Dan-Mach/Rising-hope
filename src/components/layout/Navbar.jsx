// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

// Default placeholder image (you can use a local file or this generic URL)
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to safely get data
  const getUserRole = () => user?.employee_type || user?.user?.employee_type || '';
  const getUsername = () => user?.username || user?.user?.username || 'User';
  
  // Helper to get Profile Picture
  // Adjust 'profile_picture' based on how your serializer returns it (e.g. nested in employee object)
  const getProfilePic = () => {

    if (user?.profile_picture) return user.profile_picture;
    
    if (user?.employee?.profile_picture) return user.employee.profile_picture;

    if (user?.user?.profile_picture) return user.user.profile_picture;
    
    return null;
  };

  const role = getUserRole();
  const username = getUsername();
  const profilePicUrl = getProfilePic();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">PHARMACY</Link>
      </div>
      <div className="navbar-spacer">
        <h1 className="navbar-title">{getUserRole()} | {username}</h1>
      </div>
      <ul className="navbar-links">
        <li>
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </li>

        <li ref={dropdownRef} className="navbar-profile">
          <button onClick={toggleDropdown} className="profile-trigger" title={username}>
            
            {profilePicUrl ? (
              <img 
                src={profilePicUrl.startsWith('http') ? profilePicUrl : `http://127.0.0.1:8000${profilePicUrl}`} 
                alt="Profile" 
                className="navbar-profile-img" 
              />
            ) : (
              <div className="placeholder-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            
            <span className="dropdown-arrow">▼</span>
          </button>

          {isDropdownOpen && (
            <ul className="profile-dropdown">
              <li className="dropdown-header">
                <strong>{username}</strong>
                <small>{role.replace('_', ' ')}</small>
              </li>
              <li><Link to="/profile" onClick={closeDropdown}>Edit Profile</Link></li>
              <li><Link to="/settings" onClick={closeDropdown}>Settings</Link></li>
              <li className="dropdown-divider"></li>
              <li>
                <button onClick={handleLogout} className="dropdown-logout-button">Logout</button>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}
export default Navbar;