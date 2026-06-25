import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Briefcase, Award, Rocket, Cloud, Code2, MapPin } from 'lucide-react';

const timelineEvents = [
  {
    year: '2021',
    title: 'Bachelor of Computer Applications',
    subtitle: 'Amity University, Gurgaon',
    description: 'Built the foundation — data structures, algorithms, DBMS, and web development fundamentals.',
    type: 'education',
    icon: <GraduationCap size={20} />,
    grade: 'CGPA: 7.72',
    tags: ['Java', 'HTML/CSS', 'SQL', 'DBMS'],
  },
  {
    year: '2023',
    title: 'Master of Computer Applications',
    subtitle: 'Amity University, Noida',
    description: 'Deepened expertise in cloud computing, advanced algorithms, and full-stack development. Built multiple production-grade projects.',
    type: 'education',
    icon: <GraduationCap size={20} />,
    grade: 'CGPA: 7.02',
    tags: ['React', 'Node.js', 'Python', 'Cloud Computing'],
  },
  {
    year: 'Feb 2024',
    title: 'Full Stack Developer Certificate',
    subtitle: 'GeeksforGeeks',
    description: 'Intensive full-stack program covering React, Node.js, MongoDB, Express, and deployment pipelines.',
    type: 'certification',
    icon: <Award size={20} />,
    tags: ['MERN Stack', 'REST APIs', 'Authentication'],
  },
  {
    year: 'Mar 2024',
    title: 'Software Consultant',
    subtitle: 'ENTAB INFOTECH PVT. LTD.',
    description: 'Managed secure data migrations to 10x ERP platform with 100% integrity. Bridge between clients and backend engineering.',
    type: 'work',
    icon: <Briefcase size={20} />,
    location: 'New Delhi',
    tags: ['ERP', 'Data Migration', 'Client Relations'],
  },
  {
    year: 'Jun 2025',
    title: 'Gen AI Exchange Program',
    subtitle: 'Google Cloud & Hack2skill',
    description: 'Graduated from the 5-course learning path covering Vertex AI, Gemini, Streamlit, and Imagen.',
    type: 'certification',
    icon: <Cloud size={20} />,
    tags: ['Vertex AI', 'Gemini', 'Streamlit', 'Imagen'],
  },
  {
    year: 'Oct 2024',
    title: 'Software Engineer',
    subtitle: 'Serveswiftly',
    description: 'Migrated legacy React codebase to Angular + Node.js + MongoDB. Enhanced performance by 30% through lazy loading and microservices architecture.',
    type: 'work',
    icon: <Rocket size={20} />,
    location: 'Hybrid',
    highlight: true,
    tags: ['Angular', 'Microservices', 'MongoDB', 'Performance'],
  },
  {
    year: 'Oct 2025',
    title: 'Gen AI Academy 2.0 — 6 Tracks',
    subtitle: 'Google Cloud',
    description: 'Completed all 6 tracks: DevOps, Security, Data Analytics, AI/ML, Networking, and Serverless. Built production-grade cloud projects.',
    type: 'certification',
    icon: <Cloud size={20} />,
    tags: ['GCP', 'DevOps', 'Security', 'AI/ML', 'Serverless'],
  },
  {
    year: 'Present',
    title: 'Cloud Engineer & AI Portfolio',
    subtitle: 'Building the future',
    description: 'Architecting enterprise-grade cloud solutions with GCP, Vertex AI, and Gemini. This portfolio itself is a live showcase of my cloud stack.',
    type: 'milestone',
    icon: <Code2 size={20} />,
    highlight: true,
    tags: ['Cloud Run', 'Firebase', 'Vertex AI', 'RAG'],
  },
];

const typeColors = {
  education: { bg: 'rgba(69, 162, 158, 0.15)', border: 'rgba(69, 162, 158, 0.4)', color: '#45a29e' },
  work: { bg: 'rgba(102, 252, 241, 0.15)', border: 'rgba(102, 252, 241, 0.4)', color: '#66fcf1' },
  certification: { bg: 'rgba(241, 224, 90, 0.12)', border: 'rgba(241, 224, 90, 0.35)', color: '#f1e05a' },
  milestone: { bg: 'rgba(76, 175, 80, 0.15)', border: 'rgba(76, 175, 80, 0.4)', color: '#4caf50' },
};

const JourneyTimeline = () => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [expandedIdx, setExpandedIdx] = useState(null);
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.idx);
            setVisibleItems(prev => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    itemRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" ref={sectionRef} className="journey-timeline-section">
      {/* Header */}
      <div className="journey-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MapPin size={22} className="highlight" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>My Journey</h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.6 }}>
          BCA → MCA → Cloud Engineer
        </span>
      </div>

      {/* Timeline */}
      <div className="journey-timeline">
        {/* Vertical connecting line */}
        <div className="journey-line" />

        {timelineEvents.map((event, i) => {
          const colors = typeColors[event.type] || typeColors.work;
          const isVisible = visibleItems.has(i);
          const isExpanded = expandedIdx === i;

          return (
            <div
              key={i}
              ref={el => (itemRefs.current[i] = el)}
              data-idx={i}
              className={`journey-item ${isVisible ? 'visible' : ''} ${event.highlight ? 'highlighted' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
            >
              {/* Timeline dot */}
              <div className="journey-dot" style={{ background: colors.color, boxShadow: `0 0 10px ${colors.color}60` }}>
                {event.icon}
              </div>

              {/* Year badge */}
              <div className="journey-year" style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.color }}>
                {event.year}
              </div>

              {/* Content card */}
              <div className={`journey-card glass-card ${isExpanded ? 'expanded' : ''}`}>
                {/* Type indicator */}
                <div className="journey-type-pill" style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
                  {event.type}
                </div>

                <h4 className="journey-card-title">{event.title}</h4>
                <div className="journey-card-subtitle">
                  {event.subtitle}
                  {event.location && (
                    <span className="journey-card-location">
                      <MapPin size={12} /> {event.location}
                    </span>
                  )}
                </div>

                {event.grade && (
                  <div className="journey-card-grade chip" style={{ margin: '0.5rem 0 0 0', display: 'inline-block' }}>
                    {event.grade}
                  </div>
                )}

                {/* Expandable description */}
                <div className={`journey-card-desc ${isExpanded ? 'open' : ''}`}>
                  <p>{event.description}</p>
                </div>

                {/* Tags */}
                {event.tags && (
                  <div className="journey-card-tags">
                    {event.tags.map((tag, j) => (
                      <span key={j} className="chip" style={{ margin: 0, fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="journey-expand-hint">
                  {isExpanded ? 'Click to collapse' : 'Click to expand'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default JourneyTimeline;
