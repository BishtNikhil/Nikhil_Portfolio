import { useRef } from 'react';
import { Award, ShieldCheck, Code, BadgeCheck, ExternalLink, FileText } from 'lucide-react';

// Static fallback certifications (progressive enhancement)
const staticCerts = [
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

const Badges = ({ badges: credlyBadges = [], loading = true, credlyFailed = false }) => {
  const sectionRef = useRef(null);

  return (
    <section id="badges" ref={sectionRef} className="section" style={{ background: 'rgba(255,255,255,0.01)', padding: '2rem 0' }}>
      <div className="container">
        <h2 className="section-title animate-fade-in" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Certifications & Badges</h2>

        {/* Credly Verified Badges */}
        {loading ? (
          <div className="credly-loading-grid" style={{ display: 'grid', gap: '1rem' }}>
            {[1, 2].map(i => (
              <div key={i} className="glass-card shimmer" style={{ height: '120px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : credlyBadges.length > 0 ? (
          <>
            {/* Verified Header */}
            <div className="verified-section-header animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BadgeCheck size={20} color="var(--primary-color)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>Verified on Credly</span>
              <div className="verified-line" style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div className="credly-badge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {credlyBadges.map((badge, i) => (
                <a
                  href={badge.verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  key={badge.id || i}
                  className="credly-badge-card glass-card animate-fade-in"
                  style={{ animationDelay: `${0.1 + i * 0.08}s`, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1.5rem', position: 'relative', textAlign: 'center' }}
                >
                  {/* Verified ribbon */}
                  <div className="credly-verified-ribbon" style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(102, 252, 241, 0.1)', color: 'var(--primary-color)', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    <BadgeCheck size={10} />
                    Verified
                  </div>

                  {/* Badge Image */}
                  <div className="credly-badge-image-wrap" style={{ flexShrink: 0, width: '60px', height: '60px' }}>
                    {badge.imageUrl ? (
                      <img
                        src={badge.imageUrl}
                        alt={badge.title}
                        className="credly-badge-image"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="credly-badge-placeholder" style={{ display: 'flex', alignItems: 'center', justify: 'center', width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}>
                        <Award size={28} color="var(--primary-color)" />
                      </div>
                    )}
                  </div>

                  {/* Badge Info */}
                  <div className="credly-badge-info" style={{ flex: 1, minWidth: 0 }}>
                    <h4 className="credly-badge-title" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)', margin: 0, lineHeight: '1.3' }}>{badge.title}</h4>
                    {badge.issuer && (
                      <div className="credly-badge-issuer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: '2px' }}>{badge.issuer}</div>
                    )}
                    {badge.issuedAt && (
                      <div className="credly-badge-date" style={{ fontSize: '0.7rem', color: 'var(--text-main)', opacity: 0.6, marginTop: '2px' }}>
                        Issued {new Date(badge.issuedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </>
        ) : null}

        {/* Static / Fallback Certifications */}
        {(credlyFailed || credlyBadges.length === 0) && !loading && (
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {staticCerts.map((cert, i) => (
              <div key={i} className="glass-card animate-fade-in delay-2" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem' }}>
                <div style={{ padding: '0.6rem', background: 'rgba(102, 252, 241, 0.1)', borderRadius: '12px', flexShrink: 0 }}>
                  {cert.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.1rem', color: 'var(--text-light)' }}>{cert.title}</h4>
                  <div style={{ color: 'var(--primary-color)', fontWeight: '500', marginBottom: '0.2rem', fontSize: '0.8rem' }}>{cert.issuer}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{cert.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GFG Certificates — Self-hosted with PDF verification */}
        <div className="verified-section-header animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
          <Code size={20} color="var(--primary-color)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>Other Certifications</span>
          <div className="verified-line" style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Card 1: GFG MERN Course Completion */}
          <div className="gfg-cert-card glass-card animate-fade-in" style={{ padding: '1.25rem', position: 'relative' }}>
            <div className="gfg-cert-ribbon" style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              <Award size={10} />
              Course Completion
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '12px', color: '#4caf50', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: '0.2rem' }}>
                <h4 className="gfg-cert-title" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-light)', margin: 0, paddingRight: '80px', lineHeight: '1.3' }}>
                  Full Stack MERN Developer
                </h4>
                <div className="gfg-cert-issuer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#4caf50', fontWeight: 500, marginTop: '2px' }}>
                  GeeksforGeeks
                </div>
                <div className="gfg-cert-period" style={{ fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.6, marginTop: '2px' }}>
                  Feb 2024 - May 2024
                </div>
                <p className="gfg-cert-desc" style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.5rem', lineHeights: '1.4' }}>
                  Comprehensive Full Stack program covering React, Node.js, Express, MongoDB, REST APIs, and deployment pipelines.
                </p>
                <div className="gfg-cert-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.6rem' }}>
                  <span className="chip" style={{ margin: 0, fontSize: '0.65rem', padding: '1px 6px' }}>React</span>
                  <span className="chip" style={{ margin: 0, fontSize: '0.65rem', padding: '1px 6px' }}>Node.js</span>
                  <span className="chip" style={{ margin: 0, fontSize: '0.65rem', padding: '1px 6px' }}>Express</span>
                  <span className="chip" style={{ margin: 0, fontSize: '0.65rem', padding: '1px 6px' }}>MongoDB</span>
                </div>
                
                <a
                  href="/certificates/Mern%20Completion%20Certificate.pdf"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: '0.8rem', textDecoration: 'none', fontWeight: 500 }}
                >
                  <ExternalLink size={12} />
                  View Certificate PDF
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: GFG MERN Internship + Training */}
          <div className="gfg-cert-card glass-card animate-fade-in" style={{ padding: '1.25rem', position: 'relative' }}>
            <div className="gfg-cert-ribbon" style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(102, 252, 241, 0.1)', color: 'var(--primary-color)', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              <Award size={10} />
              Internship & Training
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(102, 252, 241, 0.1)', borderRadius: '12px', color: 'var(--primary-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: '0.2rem' }}>
                <h4 className="gfg-cert-title" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-light)', margin: 0, paddingRight: '80px', lineHeight: '1.3' }}>
                  Full Stack MERN Internship
                </h4>
                <div className="gfg-cert-issuer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 500, marginTop: '2px' }}>
                  GeeksforGeeks
                </div>
                <div className="gfg-cert-period" style={{ fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.6, marginTop: '2px' }}>
                  Mar 2024 - Sep 2024
                </div>
                <p className="gfg-cert-desc" style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.5rem', lineHeights: '1.4' }}>
                  Hands-on industrial training and internship building web architecture, performance optimization, and project deployment.
                </p>
                <div className="gfg-cert-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.6rem' }}>
                  <span className="chip" style={{ margin: 0, fontSize: '0.65rem', padding: '1px 6px' }}>MERN Stack</span>
                  <span className="chip" style={{ margin: 0, fontSize: '0.65rem', padding: '1px 6px' }}>REST APIs</span>
                  <span className="chip" style={{ margin: 0, fontSize: '0.65rem', padding: '1px 6px' }}>Deployment</span>
                </div>
                
                <a
                  href="/certificates/Mern%20Internship+Training%20Certificate.pdf"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: '0.8rem', textDecoration: 'none', fontWeight: 500 }}
                >
                  <ExternalLink size={12} />
                  View Certificate PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Badges;
