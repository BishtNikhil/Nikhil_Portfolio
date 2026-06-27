import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { ArrowLeft, Activity, Server, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const EngineeringLab = () => {
  const [caseStudyVisits, setCaseStudyVisits] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselData = [
    {
      src: "/case-studies/docker-desktop.png",
      caption: "Figure 1.1: Local OCI-compliant container build via Docker Desktop, preparing the API Gateway image for Artifact Registry push and GKE orchestration."
    },
    {
      src: "/case-studies/gke-nodes.png",
      caption: "Figure 1.2: Multi-node high-availability GKE cluster orchestration, establishing the sandbox topology for rolling zero-downtime microservice transitions."
    },
    {
      src: "/case-studies/gke-workloads.png",
      caption: "Figure 1.3: Active Kubernetes workloads confirming successful custom container pull and passing liveness/readiness probes across all replica pods."
    },
    {
      src: "/case-studies/cloud-run-autoscaling.png",
      caption: "Figure 1.4: Cloud Run telemetry verifying instant horizontal scaling from 0 to peak instances under an aggressive 10,000 user Locust injection vector."
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));

  useEffect(() => {
    // Log the case study view on mount
    fetch(`${API_BASE_URL}/api/metrics/case-study`, { method: 'POST' })
      .catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '2rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <ArrowLeft size={18} />
            Back to Portfolio
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server color="var(--primary-color)" />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-light)' }}>Engineering Lab</h1>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
            Validating Resiliency: Load-Testing Serverless API to 10k Concurrency
          </h2>
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            To prove the auto-scaling capability of the backend architecture, I provisioned a high-compute Google Compute Engine VM (`n2-standard-4`) acting as a distributed Load Injector. Using Python and the Locust framework, the load injector ramped up to 10,000 concurrent users bombarding the Cloud Run API Gateway.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
             <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  <Activity size={16} /> <b>Infrastructure</b>
                </div>
                <div>GCP Cloud Run & Compute Engine</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  <Server size={16} /> <b>Orchestration</b>
                </div>
                <div>GKE 3-Node Cluster Sandbox</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={16} /> <b>Load Framework</b>
                </div>
                <div>Locust (Python Distributed)</div>
             </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '1rem', marginTop: '2rem' }}>Phase 1 & 2: Architectural Validation & Telemetry</h3>
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            The technical carousel below validates the orchestration topology and load telemetry. It proves the successful containerization, GKE deployment, and the final serverless autoscaling response to the 10,000 concurrent user injection vector.
          </p>
          
          {/* Technical Carousel */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', marginBottom: '3rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: '1rem', minHeight: '400px' }}>
              
              <button onClick={prevSlide} style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#fff', zIndex: 10 }}>
                <ChevronLeft size={24} />
              </button>

              <img 
                src={carouselData[currentSlide].src} 
                alt="Architecture Telemetry" 
                style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} 
              />

              <button onClick={nextSlide} style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#fff', zIndex: 10 }}>
                <ChevronRight size={24} />
              </button>

            </div>
            <div style={{ padding: '1.5rem', background: '#111', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: 0, color: 'var(--primary-color)', fontSize: '0.95rem', fontFamily: 'monospace', lineHeight: '1.5' }}>
                {carouselData[currentSlide].caption}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                {carouselData.map((_, idx) => (
                  <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === currentSlide ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)' }} />
                ))}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '1rem' }}>Interactive Locust Test Report</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            The iframe below loads the raw HTML export directly from the Locust testing instance. You can interact with the charts to see Requests Per Second (RPS) and latency percentiles.
          </p>

          {/* Locust HTML Report Embedded */}
          <div style={{ width: '100%', height: '800px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#fff' }}>
            <iframe 
              src="/case-studies/locust_report.html" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              title="Locust Load Test Report">
            </iframe>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EngineeringLab;
