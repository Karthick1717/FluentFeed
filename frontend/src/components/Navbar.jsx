import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-bar b1" />
          <span className="brand-bar b2" />
          <span className="brand-bar b3" />
        </span>
        FluentFeed
      </Link>

      {user && (
        <nav className="nav-links">
          <Link to="/">Speak</Link>
          <Link to="/history">History</Link>
          <span className="nav-user">{user.name}</span>
          <button className="btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
