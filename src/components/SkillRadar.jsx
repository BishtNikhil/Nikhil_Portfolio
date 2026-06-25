import { useEffect, useRef, useState } from 'react';
import { Radar, Award } from 'lucide-react';

const calculateSkills = (badges) => {
  // Base levels representing academic BCA/MCA foundation + initial work
  const skills = {
    'Cloud / GCP': { value: 65, sources: ['BCA/MCA Cloud Computing fundamentals', 'Cloud Run / Cloud Functions deployments'] },
    'AI / ML': { value: 55, sources: ['Vertex AI & Gemini API integrations'] },
    'Frontend': { value: 70, sources: ['Vite, HTML/CSS layout', 'Serveswiftly migration projects'] },
    'Backend': { value: 70, sources: ['Node.js API design', 'ENTAB database management'] },
    'DevOps': { value: 60, sources: ['Docker containerization'] },
    'Security': { value: 60, sources: ['Helmet.js, CORS headers enforcement'] }
  };

  // 1. GeeksforGeeks Full Stack MERN completions are always present as self-hosted certificates
  skills['Frontend'].value += 15;
  skills['Frontend'].sources.push('GFG Full Stack Course Completion');
  skills['Backend'].value += 12;
  skills['Backend'].sources.push('GFG MERN Internship & Training');

  // 2. Iterate through fetched Credly badges to apply verified boosts
  if (Array.isArray(badges) && badges.length > 0) {
    badges.forEach(badge => {
      const title = (badge.title || '').toLowerCase();
      // Handle array of objects or strings for skills
      const skillsList = Array.isArray(badge.skills) 
        ? badge.skills.map(s => (typeof s === 'object' && s !== null ? s.name : s)?.toLowerCase() || '') 
        : [];
      
      const isGCP = title.includes('google cloud') || title.includes('gcp') || skillsList.some(s => s.includes('google cloud') || s.includes('gcp'));
      
      if (isGCP) {
        skills['Cloud / GCP'].value += 4;
        skills['Cloud / GCP'].sources.push(`Credly: ${badge.title}`);
        
        if (title.includes('devops') || skillsList.some(s => s.includes('devops') || s.includes('ci/cd') || s.includes('build'))) {
          skills['DevOps'].value += 15;
          skills['DevOps'].sources.push(`Verified DevOps Track`);
        }
        if (title.includes('security') || skillsList.some(s => s.includes('security') || s.includes('iam') || s.includes('least-privilege'))) {
          skills['Security'].value += 15;
          skills['Security'].sources.push(`Verified Cloud Security Track`);
        }
        if (title.includes('data analytics') || title.includes('analytics') || skillsList.some(s => s.includes('analytics') || s.includes('bigquery') || s.includes('dataplex'))) {
          skills['Cloud / GCP'].value += 4;
          skills['Cloud / GCP'].sources.push(`Verified Data Analytics Track`);
        }
        if (title.includes('networking') || skillsList.some(s => s.includes('networking') || s.includes('firewall'))) {
          skills['Cloud / GCP'].value += 4;
          skills['Cloud / GCP'].sources.push(`Verified Networking Track`);
        }
        if (title.includes('serverless') || title.includes('run') || title.includes('functions')) {
          skills['Cloud / GCP'].value += 5;
          skills['Cloud / GCP'].sources.push(`Verified Serverless Track`);
        }
        if (title.includes('ai') || title.includes('ml') || title.includes('machine learning') || skillsList.some(s => s.includes('ai') || s.includes('ml') || s.includes('vertex') || s.includes('gemini') || s.includes('generative'))) {
          skills['AI / ML'].value += 15;
          skills['AI / ML'].sources.push(`Verified AI/ML Track`);
        }
      }

      if (title.includes('exchange') || title.includes('hack2skill')) {
        skills['AI / ML'].value += 12;
        skills['AI / ML'].sources.push('Verified Gen AI Exchange Graduate');
      }
    });
  }

  return Object.entries(skills).map(([label, info]) => ({
    label,
    value: Math.min(98, info.value),
    source: [...new Set(info.sources)].join(', ')
  }));
};

// SVG Radar/Spider Chart — pure CSS + SVG
const SkillRadar = ({ badges = [], loading = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const skillData = calculateSkills(badges);
  const numAxes = skillData.length;
  const cx = 150, cy = 150, maxR = 110;
  const angleStep = (2 * Math.PI) / numAxes;

  // Generate polygon points for a given radius multiplier per axis
  const getPolygonPoints = (values) => {
    return values.map((v, i) => {
      const angle = angleStep * i - Math.PI / 2; // start from top
      const r = (v / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  };

  // Grid rings at 25%, 50%, 75%, 100%
  const gridLevels = [25, 50, 75, 100];

  // Axis endpoints
  const axes = skillData.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x: cx + maxR * Math.cos(angle),
      y: cy + maxR * Math.sin(angle),
    };
  });

  // Label positions (slightly outside the chart)
  const labelPositions = skillData.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelR = maxR + 28;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
    };
  });

  const skillValues = skillData.map(s => s.value);
  const dataPoints = getPolygonPoints(skillValues);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className={`skill-radar-section ${isVisible ? 'visible' : ''}`}
    >
      {/* Header */}
      <div className="skill-radar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Radar size={22} className="highlight" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Skill Radar</h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Award size={12} className="highlight" />
          {loading ? 'Analyzing credentials...' : 'Dynamically mapped from verified credentials'}
        </span>
      </div>

      <div className="glass-card skill-radar-card">
        <svg
          viewBox="0 0 300 300"
          className={`radar-svg ${isVisible ? 'animate' : ''}`}
        >
          {/* Grid rings */}
          {gridLevels.map((level) => {
            const pts = skillData.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const r = (level / 100) * maxR;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={level}
                points={pts}
                className="radar-grid-ring"
              />
            );
          })}

          {/* Axis lines */}
          {axes.map((axis, i) => (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={axis.x} y2={axis.y}
              className="radar-axis-line"
            />
          ))}

          {/* Data polygon (filled shape) */}
          <polygon
            points={dataPoints}
            className="radar-data-fill"
          />

          {/* Data polygon outline */}
          <polygon
            points={dataPoints}
            className="radar-data-outline"
          />

          {/* Data points (dots on vertices) */}
          {skillValues.map((v, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const r = (v / 100) * maxR;
            const dotX = cx + r * Math.cos(angle);
            const dotY = cy + r * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={dotX} cy={dotY} r={hoveredIdx === i ? 5 : 3.5}
                className={`radar-data-dot ${hoveredIdx === i ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Labels */}
          {skillData.map((skill, i) => (
            <text
              key={i}
              x={labelPositions[i].x}
              y={labelPositions[i].y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`radar-label ${hoveredIdx === i ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {skill.label}
            </text>
          ))}

          {/* Percentage labels at dots */}
          {hoveredIdx !== null && (() => {
            const v = skillValues[hoveredIdx];
            const angle = angleStep * hoveredIdx - Math.PI / 2;
            const r = (v / 100) * maxR;
            return (
              <text
                x={cx + r * Math.cos(angle)}
                y={cx + r * Math.sin(angle) - 10}
                textAnchor="middle"
                className="radar-pct-label"
              >
                {v}%
              </text>
            );
          })()}
        </svg>

        {/* Skill detail on hover */}
        <div className="skill-radar-detail">
          {hoveredIdx !== null ? (
            <>
              <span className="skill-radar-detail-name">{skillData[hoveredIdx].label}</span>
              <span className="skill-radar-detail-bar">
                <span
                  className="skill-radar-detail-fill"
                  style={{ width: `${skillData[hoveredIdx].value}%` }}
                />
              </span>
              <span className="skill-radar-detail-source">{skillData[hoveredIdx].source}</span>
            </>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.5 }}>
              Hover over a skill axis to see details
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillRadar;
