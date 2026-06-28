import { ArrowLeft, BarChart3, Activity, FolderGit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const Admin = () => {
  const [caseStudyVisits, setCaseStudyVisits] = useState(0);
  const [projectClicks, setProjectClicks] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/metrics/case-study`)
      .then(res => res.json())
      .then(result => {
        if (result.success) setCaseStudyVisits(result.visits);
      })
      .catch(console.error);

    fetch(`${API_BASE_URL}/api/metrics/projects`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) setProjectClicks(result.data);
      })
      .catch(console.error);
  }, []);

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

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  <Activity size={18} /> <b>Engineering Lab Views</b>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                  {caseStudyVisits}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>Total Recruiter Clicks on Case Study</div>
             </div>
             
             {Object.entries(projectClicks)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, clicks]) => (
                  <div key={name} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <FolderGit2 size={18} /> <b title={name}>{name}</b>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                      {clicks}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>Total Project Clicks</div>
                 </div>
             ))}
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
