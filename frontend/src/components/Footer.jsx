import { Box, Layers } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(102, 252, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)', fontSize: '0.75rem' }}>
              <Layers size={14} color="var(--primary-color)" />
              CI/CD Pipeline:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4caf50', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(76, 175, 80, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }} />
              Passing
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.6, marginTop: '0.5rem' }}>
            Automatically deployed via <span style={{ color: 'var(--text-light)' }}>Google Cloud Build</span> & <span style={{ color: 'var(--text-light)' }}>Artifact Registry</span>
          </p>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-main)', opacity: 0.4, marginTop: '1rem' }}>
            © {new Date().getFullYear()} Nikhil Singh Bisht. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
