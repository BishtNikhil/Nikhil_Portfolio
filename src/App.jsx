import { useEffect } from 'react';
import { API_BASE_URL } from './config';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Badges from './components/Badges';
import AITwin from './components/AITwin';

function App() {
  useEffect(() => {
    // Log the visit silently in the background
    // Passes through API Gateway -> updates Firestore -> streams to BigQuery
    fetch(`${API_BASE_URL}/api/metrics/visit`, { method: 'POST' })
      .catch(console.error); // Silently ignore errors
  }, []);

  return (
    <>
      <nav className="navbar animate-fade-in">
        <div className="container nav-container">
          <div className="logo">Nikhil Singh Bisht</div>
          <ul className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
            <li><a href="#about">About</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#chat">AI Twin</a></li>
          </ul>
        </div>
      </nav>

      <div className="portfolio-layout">

        {/* Left/Main Column - Main Content & Chat */}
        <div className="portfolio-main">
          <Hero />

          <Experience />

          <section id="chat" style={{ padding: '2rem 0' }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Chat with my AI Twin</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
              Powered by Google Gemini and Vertex AI. Ask questions about my experience, skills, and qualifications!
            </p>
            <AITwin />
          </section>
        </div>

        {/* Right Sidebar - Badges & Projects */}
        <div className="portfolio-sidebar">
          <Badges />
          <Projects />
        </div>

      </div>
    </>
  );
}

export default App;
