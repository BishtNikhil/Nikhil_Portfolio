import { Briefcase, Calendar, GraduationCap } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Software Engineer',
      company: 'Serveswiftly',
      period: 'Oct 2024 - Present',
      location: 'Hybrid',
      description: 'Optimized legacy React codebase and migrated core modules to Angular, Node.js, and MongoDB. Enhanced frontend performance by 30% through lazy loading and implemented Microservices architecture. Led code reviews to improve team productivity.'
    },
    {
      title: 'Software Consultant',
      company: 'ENTAB INFOTECH PVT. LTD.',
      period: 'Mar 2024 - Sep 2024',
      location: 'New Delhi',
      description: 'Managed secure migration of client data to the 10x ERP platform ensuring 100% data integrity. Provided technical consultation and troubleshooting for complex ERP modules as a bridge between clients and backend engineering.'
    }
  ];

  const educations = [
    {
      degree: 'Master of Computer Applications (MCA)',
      institution: 'Amity University, Noida',
      period: '2023',
      grade: 'CGPA: 7.02'
    },
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'Amity University, Gurgaon',
      period: '2021',
      grade: 'CGPA: 7.72'
    }
  ];

  return (
    <section id="experience" className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <h2 className="section-title animate-fade-in">Experience & Education</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          
          <div className="animate-fade-in delay-1">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '2rem' }}>
              <Briefcase size={24} /> Professional Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {experiences.map((exp, i) => (
                <div key={i} className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gradient-1)' }}></div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{exp.title}</h4>
                  <div style={{ color: 'var(--primary-color)', fontWeight: '500', marginBottom: '1rem' }}>{exp.company} <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 'normal' }}>• {exp.location}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <Calendar size={14} /> {exp.period}
                  </div>
                  <p style={{ fontSize: '0.95rem' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-in delay-2">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '2rem' }}>
              <GraduationCap size={24} /> Education
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {educations.map((edu, i) => (
                <div key={i} className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gradient-1)' }}></div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{edu.degree}</h4>
                  <div style={{ color: 'var(--primary-color)', fontWeight: '500', marginBottom: '1rem' }}>{edu.institution}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <Calendar size={14} /> Graduated {edu.period}
                  </div>
                  <div className="chip" style={{ margin: 0, marginTop: '0.5rem' }}>{edu.grade}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Experience;
