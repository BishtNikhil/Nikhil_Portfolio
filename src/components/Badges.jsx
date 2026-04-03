
import { Award, ShieldCheck, Code } from 'lucide-react';

const Badges = () => {

  const certifications = [
    {
      title: 'Gen AI Academy 2.0 (6 Tracks)',
      issuer: 'Google Cloud',
      period: 'Oct 2025 - Jan 2026',
      details: 'DevOps, Security, Data Analytics, AI/ML, Networking, Serverless',
      icon: <Award size={32} color="var(--primary-color)" />
    },
    {
      title: 'Gen AI Exchange Program Graduate',
      issuer: 'Google Cloud & Hack2skill',
      period: 'Jun 2025',
      details: 'Completed 5-course learning path (Vertex AI, Gemini, Streamlit, Imagen)',
      icon: <ShieldCheck size={32} color="var(--primary-color)" />
    },
    {
      title: 'Full Stack Developer',
      issuer: 'GeeksforGeeks',
      period: 'Feb 2024 - May 2024',
      details: 'Comprehensive Full Stack Development program',
      icon: <Code size={32} color="var(--primary-color)" />
    }
  ];

  return (
    <section id="badges" className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <h2 className="section-title animate-fade-in">Certifications & Badges</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {certifications.map((cert, i) => (
            <div key={i} className="glass-card animate-fade-in delay-2" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '1rem', background: 'rgba(102, 252, 241, 0.1)', borderRadius: '16px' }}>
                {cert.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.3rem', color: 'var(--text-light)' }}>{cert.title}</h4>
                <div style={{ color: 'var(--primary-color)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{cert.issuer}</div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>{cert.period}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{cert.details}</p>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default Badges;
