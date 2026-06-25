import { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import Hero from './components/Hero';
import LiveTracker from './components/LiveTracker';
import SkillRadar from './components/SkillRadar';
import Experience from './components/Experience';
import JourneyTimeline from './components/JourneyTimeline';
import Projects from './components/Projects';
import Badges from './components/Badges';
import SecurityBadge from './components/SecurityBadge';
import AITwin from './components/AITwin';
import Footer from './components/Footer';
import Admin from './components/Admin';

const CREDLY_USER_ID = 'nikhil-bisht.76ed7c50';

function App() {
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [credlyFailed, setCredlyFailed] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    // Log the visit silently in the background
    fetch(`${API_BASE_URL}/api/metrics/visit`, { method: 'POST' })
      .catch(console.error); // Silently ignore errors

    // Fetch Credly badges
    fetch(`${API_BASE_URL}/api/stats/credly/${CREDLY_USER_ID}/badges`)
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setBadges(result.data);
        } else {
          setCredlyFailed(true);
        }
      })
      .catch(() => setCredlyFailed(true))
      .finally(() => setLoadingBadges(false));
  }, []);

  if (currentHash === '#admin') {
    return <Admin />;
  }

  return (
    <>
      <nav className="navbar animate-fade-in">
        <div className="container nav-container">
          <div className="logo">Nikhil Singh Bisht</div>
          <ul className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
            <li><a href="#about">About</a></li>
            <li><a href="#live-activity">Activity</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#journey">Journey</a></li>
            <li><a href="#chat">AI Twin</a></li>
          </ul>
        </div>
      </nav>

      <div className="portfolio-layout">

        {/* Left/Main Column - Main Content & Chat */}
        <div className="portfolio-main">
          <Hero />

          <LiveTracker />

          <SkillRadar badges={badges} loading={loadingBadges} />

          <Experience />

          <JourneyTimeline />

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
          <Badges badges={badges} loading={loadingBadges} credlyFailed={credlyFailed} />
          <SecurityBadge />
          <Projects />
        </div>

      </div>
      
      <Footer />
    </>
  );
}

export default App;
