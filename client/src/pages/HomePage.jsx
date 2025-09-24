import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBrowseProducts = () => {
    navigate('/products');
  };

  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <header className="hero">
          <h1>Welcome to Herb & Veda</h1>
          <p className="hero-subtitle"></p>
          <p>Hello, {user?.name || user?.email}! Discover our authentic Ayurvedic products.</p>
        </header>
        
        <section className="cta-section">
          <h2>Start Your Wellness Journey</h2>
          <p>Explore our range of authentic Ayurvedic products and consultations</p>
          <button className="cta-button" onClick={handleBrowseProducts}>Browse Products</button>
        </section>

        <section className="features">
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🌿 Natural Herbs</h3>
              <p>Premium quality herbs sourced directly from organic farms across India.</p>
            </div>
            <div className="feature-card">
              <h3>⚕️ Ayurvedic Formulas</h3>
              <p>Traditional formulations prepared by experienced Ayurvedic practitioners.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}