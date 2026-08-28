import React from "react";
import { NavLink } from "react-router-dom";
import { getSession, signOut } from "../auth.js";

/**
 * Navbar.jsx
 * Shared navigation bar. NavLink automatically applies an "active"
 * class-like styling based on the current route.
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [session, setSession] = React.useState(getSession);
  const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  function handleSignOut() {
    signOut();
    setSession(null);
    closeMenu();
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-smartshelf">
      <div className="container">
        <NavLink className="navbar-brand" to="/" onClick={closeMenu}>
          📦 SmartShelf
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="nav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse${isMenuOpen ? " show" : ""}`} id="nav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className={linkClass} to="/" onClick={closeMenu}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/products" onClick={closeMenu}>Products</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/add-product" onClick={closeMenu}>Add Product</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/stock-movements" onClick={closeMenu}>Stock</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/reports" onClick={closeMenu}>Reports</NavLink>
            </li>
            {session ? (
              <li className="nav-item profile-menu ms-lg-2">
                <button
                  type="button"
                  className="profile-button"
                  aria-expanded={isProfileOpen}
                  aria-controls="profile-actions"
                  onClick={() => setIsProfileOpen((isOpen) => !isOpen)}
                >
                  <span className="navbar-avatar">{(session.name || session.email).charAt(0).toUpperCase()}</span>
                  <span className="navbar-user">{session.name || session.email}</span>
                  <span className="profile-chevron" aria-hidden="true">⌄</span>
                </button>
                {isProfileOpen && (
                  <div className="profile-dropdown" id="profile-actions">
                    <div className="profile-email">{session.email}</div>
                    <button type="button" className="profile-signout" onClick={handleSignOut}>Sign out</button>
                  </div>
                )}
              </li>
            ) : (
              <li className="nav-item">
                <NavLink className={linkClass} to="/login" onClick={closeMenu}>Sign in</NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
