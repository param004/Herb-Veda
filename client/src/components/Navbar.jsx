import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import UserProfile from './UserProfile.jsx';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, setToken, setUser } = useAuth();
  const { getCartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();

  const logout = () => {
    setToken('');
    setUser(null);
    setShowUserDropdown(false);
  };

  const openProfile = () => {
    setShowUserProfile(true);
    setShowUserDropdown(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <img src={logo} alt="Herb & Veda" className="nav-logo" />
          <span>Herb & Veda</span>
        </Link>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className={`nav-link ${isActive('/products') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Products
          </Link>
          {/* About link removed */}
          <Link 
            to="/contact" 
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          
          <Link 
            to="/cart" 
            className={`nav-link cart-link ${isActive('/cart') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Cart
            {getCartItemsCount() > 0 && (
              <span className="cart-badge">{getCartItemsCount()}</span>
            )}
          </Link>
          
          <Link 
            to="/orders" 
            className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Orders
          </Link>
          
          <div className="nav-user">
            <div className="user-dropdown">
              <button 
                className="user-name-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                Hi, {user?.name || user?.email}
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showUserDropdown && (
                <div className="user-dropdown-menu">
                  <button onClick={openProfile} className="dropdown-item">
                    Personal Info
                  </button>
                  <Link to="/orders" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                    My Orders
                  </Link>
                  <button onClick={logout} className="dropdown-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {showUserProfile && (
        <div className="modal-overlay" onClick={() => setShowUserProfile(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfile onClose={() => setShowUserProfile(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}