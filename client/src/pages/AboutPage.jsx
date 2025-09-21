import Navbar from '../components/Navbar.jsx';

export default function AboutPage() {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <header className="page-header">
          <h1>About Herb & Veda</h1>
          <p>Our journey in authentic Ayurvedic wellness</p>
        </header>
        
        <div className="about-content">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              Founded with a deep respect for ancient Ayurvedic wisdom, Herb & Veda was born from 
              a passion to bring authentic, traditional healing practices to the modern world. 
              Our journey began with a simple belief: nature holds the key to optimal health and wellness.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              To provide premium quality Ayurvedic products that honor traditional formulations 
              while meeting modern standards of purity and efficacy. We bridge the gap between 
              ancient wisdom and contemporary wellness needs.
            </p>
          </section>

          <section className="about-section">
            <h2>Why Choose Us?</h2>
            <div className="values-grid">
              <div className="value-item">
                <h4>🌿 Authentic Formulations</h4>
                <p>Traditional recipes passed down through generations of Ayurvedic practitioners</p>
              </div>
              <div className="value-item">
                <h4>Modern Testing</h4>
                <p>Every product undergoes rigorous quality control and purity testing</p>
              </div>
              <div className="value-item">
                <h4>Sustainable Sourcing</h4>
                <p>Ethically sourced herbs from certified organic farms</p>
              </div>
              <div className="value-item">
                <h4>⚕️ Expert Guidance</h4>
                <p>Certified Ayurvedic practitioners guide our formulations and customer support</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Commitment</h2>
            <p>
              We are committed to preserving the integrity of Ayurveda while making it accessible 
              to everyone seeking natural wellness solutions. Every product is a testament to our 
              dedication to quality, authenticity, and your well-being.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}