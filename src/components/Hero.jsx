import { useEffect, useState } from 'react';
import { Mail, MapPin, ExternalLink, Download, Code2, Briefcase, Eye, Wifi } from 'lucide-react';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { API_BASE_URL } from '../config';

const Hero = () => {
  const [visitors, setVisitors] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Listen to real-time updates from Firestore!
    const unsub = onSnapshot(doc(db, 'portfolio_stats', 'visits'), (docSnap) => {
      if (docSnap.exists()) {
        setVisitors(docSnap.data().total_visits);
      }
    });

    // Check Cloud Run API Gateway Health
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setApiStatus('live');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));

    return () => unsub();
  }, []);

  const statusColor = apiStatus === 'live' ? '#4caf50' : apiStatus === 'offline' ? '#f44336' : '#ffa726';
  const statusLabel = apiStatus === 'live' ? 'API Gateway Live' : apiStatus === 'offline' ? 'API Offline' : 'Checking...';

  return (
    <section id="about" className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) auto', gap: '4rem', alignItems: 'center' }}>

        <div className="hero-content animate-fade-in delay-1">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
             <div className="chip" style={{ margin: 0, whiteSpace: 'nowrap' }}>Available for Opportunities</div>
             {visitors !== null && (
               <div className="chip" style={{ margin: 0, background: 'rgba(102, 252, 241, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(102, 252, 241, 0.3)', whiteSpace: 'nowrap', fontWeight: '500' }}>
                 <Eye size={14} /> {visitors.toLocaleString()} Views
               </div>
             )}
          </div>
          <h1 style={{ fontSize: '4rem', lineHeight: '1.2', marginTop: '0.5rem' }}>
            Hi, I&apos;m <br />
            <span className="text-gradient">Nikhil Singh Bisht</span>
          </h1>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: '500', marginBottom: '1.5rem' }}>
            Cloud Engineer & Full Stack Developer
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px' }}>
            MCA Graduate and Google Cloud Certified professional with hands-on expertise in the Generative AI and GCP ecosystem. I specialize in building secure, scalable, and serverless applications bridging the gap between development and operations.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href="mailto:nikhilbisht.301@gmail.com" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} /> Contact Me
            </a>
            <a href="/Nikhil_Singh_Bisht_Resume.pdf" download="Nikhil_Singh_Bisht_Resume.pdf" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={18} /> Download Resume
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${statusColor}40` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}`, display: 'inline-block' }} />
              <Wifi size={14} color={statusColor} />
              <span style={{ fontSize: '0.8rem', color: statusColor, fontWeight: 500, whiteSpace: 'nowrap' }}>{statusLabel}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem', opacity: 0.8 }}>Kaggle & GCP Badges dynamically integrated via APIs.</p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://github.com/BishtNikhil" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Code2 size={18} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/nikhil-singh-bisht/" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Briefcase size={18} /> LinkedIn
            </a>
            <a href="https://www.kaggle.com/nikhilbisht98" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <ExternalLink size={18} /> Kaggle
            </a>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', color: 'var(--text-main)', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} className="highlight" /> New Delhi, India</span>
          </div>
        </div>

        <div className="hero-visual animate-fade-in delay-2" style={{ display: 'none', '@media (minWidth: 768px)': { display: 'block' } }}>
          <div style={{
            width: '350px',
            height: '450px',
            borderRadius: '24px',
            background: 'var(--gradient-glass)',
            border: 'var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%', left: '-50%', width: '200%', height: '200%',
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(102, 252, 241, 0.1) 0%, transparent 60%, rgba(102, 252, 241, 0.1) 100%)',
              animation: 'spin 10s linear infinite'
            }}></div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>Core Stack</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {['GCP', 'Vertex AI', 'Firebase', 'Gemini Pro', 'React.js', 'Angular', 'Node.js', 'Docker', 'Kubernetes', 'Python', 'BigQuery'].map(skill => (
                  <span key={skill} className="chip">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
