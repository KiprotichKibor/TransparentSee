import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to TransparenSee</h1>
          <p>Empowering citizens to report and investigate corruption for a more transparent society.</p>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </section>

      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Anonymous Reporting</h3>
            <p>Submit reports without revealing your identity, ensuring your safety and privacy.</p>
          </div>
          <div className="feature-card">
            <h3>Collaborative Investigations</h3>
            <p>Join forces with other users to investigate and verify reports.</p>
          </div>
          <div className="feature-card">
            <h3>Data Visualization</h3>
            <p>View trends and patterns in corruption reports through interactive charts and graphs.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Platform</h3>
            <p>Your data is protected with state-of-the-art security measures.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to make a difference?</h2>
        <p>Join TransparenSee today and help build a more transparent future.</p>
        <Link to="/register" className="btn btn-secondary">Sign Up Now</Link>
      </section>
    </div>
  );
};

export default Home;