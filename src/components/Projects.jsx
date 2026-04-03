import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { FolderGit2, Star, GitBranch, ArrowUpRight } from 'lucide-react';

const Projects = () => {
  const [githubProjects, setGithubProjects] = useState([]);

  // Fallback to resume projects if API fails or while loading
  const resumeProjects = [
    {
      name: 'AI-Powered Multimodal RAG Application',
      description: 'Built a Generative AI application using Gemini and Vertex AI with Multimodal RAG. Deployed full stack on Cloud Run and integrated Imagen for dynamic visual assets.',
      tags: ['Vertex AI', 'Gemini', 'Cloud Run', 'Streamlit', 'Imagen'],
      link: '#'
    },
    {
      name: 'Serverless Event-Driven Architecture',
      description: 'Resilient asynchronous system using Pub/Sub and Cloud Run. Gateway integrated with Firebase/Firestore. Automated deployment with Cloud Build reducing time by 40%.',
      tags: ['Pub/Sub', 'Cloud Run', 'Firebase', 'Cloud Build'],
      link: '#'
    },
    {
      name: 'Secure Data Lake & Streaming Pipeline',
      description: 'Architected secure data lake using Cloud Storage, Dataplex, and IAM. Built real-time Dataflow pipeline integrated with BigQuery and DLP API for PII redaction.',
      tags: ['Dataflow', 'BigQuery', 'Dataplex', 'Cloud Storage'],
      link: '#'
    },
    {
      name: 'AI Document Processing Workflow',
      description: 'Automated pipeline using Document AI to extract structured data from unstructured forms. Vertex AI and Cloud Functions to trigger ML models for multimedia.',
      tags: ['Document AI', 'Vertex AI', 'Cloud Functions'],
      link: '#'
    }
  ];

  useEffect(() => {
    // Fetch GitHub repos dynamically
    // Using your real GitHub username
    const GITHUB_USERNAME = 'BishtNikhil'; 
    
    fetch(`${API_BASE_URL}/api/stats/github/${GITHUB_USERNAME}`)
      .then(res => {
        if(!res.ok) throw new Error('Failed to fetch from API Gateway');
        return res.json();
      })
      .then(result => {
        if(result.success && Array.isArray(result.data) && result.data.length > 0) {
          setGithubProjects(result.data);
        }
      })
      .catch(err => console.error("GitHub fetch error:", err));
  }, []);

  const displayProjects = githubProjects.length > 0 ? githubProjects : resumeProjects;

  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title animate-fade-in">Featured Projects</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {displayProjects.map((project, i) => (
            <a href={project.link} target="_blank" rel="noreferrer" key={i} className="glass-card animate-fade-in delay-1" style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <FolderGit2 size={32} color="var(--primary-color)" />
                <div style={{ display: 'flex', gap: '0.8rem', color: 'var(--text-main)' }}>
                  {project.stars !== undefined && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Star size={16} /> {project.stars}</span>
                  )}
                  {project.forks !== undefined && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><GitBranch size={16} /> {project.forks}</span>
                  )}
                  <ArrowUpRight size={20} className="hover-icon" />
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-light)' }}>{project.name}</h3>
              <p style={{ fontSize: '0.95rem', flexGrow: 1, marginBottom: '1.5rem', color: 'var(--text-main)' }}>{project.description}</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(project.tags || (project.language ? [project.language] : [])).map((tag, j) => (
                  <span key={j} className="chip" style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>{tag}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
