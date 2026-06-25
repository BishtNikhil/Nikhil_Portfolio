import { Shield, Lock, ScanEye, Gauge, Globe, ShieldCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: <Lock size={16} />,
    title: 'Cloud IAM & VPC',
    detail: 'Least-privilege & VPC Service Controls',
    status: 'active',
  },
  {
    icon: <ScanEye size={16} />,
    title: 'DLP API',
    detail: 'PII auto-redaction on chat',
    status: 'active',
  },
  {
    icon: <ShieldCheck size={16} />,
    title: 'Helmet.js',
    detail: 'Security headers enforced',
    status: 'active',
  },
  {
    icon: <Gauge size={16} />,
    title: 'Rate Limiting',
    detail: '100 req / 15 min per IP',
    status: 'active',
  },
  {
    icon: <Globe size={16} />,
    title: 'CORS Policy',
    detail: 'Origin-locked to portfolio',
    status: 'active',
  },
];

const SecurityBadge = () => {
  return (
    <section id="security" className="security-card glass-card animate-fade-in delay-2">
      {/* Animated scan line */}
      <div className="security-scan-line" />

      {/* Header */}
      <div className="security-header">
        <Shield size={22} color="var(--primary-color)" />
        <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-light)' }}>
          Security Shield
        </h3>
        <span className="security-status-pill">
          <span className="security-status-dot" />
          All Systems Go
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '1rem', marginTop: '0.5rem' }}>
        Enterprise-grade security powering this portfolio
      </p>

      {/* Feature List */}
      <div className="security-features">
        {securityFeatures.map((feat, i) => (
          <div
            key={i}
            className="security-feature-item"
            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
          >
            <div className="security-feature-icon">
              {feat.icon}
            </div>
            <div className="security-feature-info">
              <span className="security-feature-title">{feat.title}</span>
              <span className="security-feature-detail">{feat.detail}</span>
            </div>
            <div className={`security-feature-status ${feat.status}`}>
              <span className="security-feature-dot" />
            </div>
          </div>
        ))}
      </div>

      {/* Architecture note */}
      <div className="security-footer">
        <a
          href="https://cloud.google.com/security"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          Built on Google Cloud Security →
        </a>
      </div>
    </section>
  );
};

export default SecurityBadge;
