import { ArrowLeft, BarChart3 } from 'lucide-react';

const Admin = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '2rem 0' }}>
      <div className="container">
        
        {/* Navigation / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <ArrowLeft size={18} />
            Back to Portfolio
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 color="var(--primary-color)" />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-light)' }}>Admin Observability</h1>
          </div>
        </div>

        {/* Dashboard Card */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Portfolio Visitor Analytics</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.8, maxWidth: '600px' }}>
              Real-time metrics tracking recruiter clicks and global visits. Data is ingested through API Gateway into BigQuery, and visualized here via Looker Studio.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', width: '100%', display: 'flex', justifyContent: 'center', padding: '1rem' }}>
            <iframe 
              width="100%" 
              height="600" 
              src="https://datastudio.google.com/embed/reporting/c85d04f1-94da-4670-9766-ec24ad784054/page/6zXD" 
              frameBorder="0" 
              style={{ border: 0, maxWidth: '1000px' }} 
              allowFullScreen 
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
            </iframe>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
