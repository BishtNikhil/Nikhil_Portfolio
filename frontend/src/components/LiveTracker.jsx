import { useState, useEffect, useRef } from 'react';
import { Activity, Flame, CalendarDays, Zap, Clock, Code2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Language color palette for the donut chart
const LANG_COLORS = {
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Python': '#3572A5',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Java': '#b07219',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'C++': '#f34b7d',
  'C#': '#178600',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  'Shell': '#89e051',
  'Bash': '#89e051',
  'SQL': '#e38c00',
  'YAML': '#cb171e',
  'JSON': '#292929',
  'Markdown': '#083fa1',
  'Docker': '#384d54',
  'JSX': '#f1e05a',
  'TSX': '#3178c6',
  'Vue': '#41b883',
  'SCSS': '#c6538c',
  'Other': '#8b8b8b',
};

function getLangColor(name) {
  return LANG_COLORS[name] || LANG_COLORS['Other'];
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const GITHUB_USERNAME = 'BishtNikhil';

const LiveTracker = () => {
  const [githubData, setGithubData] = useState(null);
  const [wakaData, setWakaData] = useState(null);
  const [githubLoading, setGithubLoading] = useState(true);
  const [wakaLoading, setWakaLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Intersection observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch GitHub activity
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/github/${GITHUB_USERNAME}/activity`)
      .then(r => r.json())
      .then(result => {
        if (result.success) setGithubData(result.data);
      })
      .catch(err => console.error('GitHub activity fetch error:', err))
      .finally(() => setGithubLoading(false));
  }, []);

  // Fetch WakaTime stats
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats/wakatime`)
      .then(r => r.json())
      .then(result => {
        if (result.success) setWakaData(result.data);
      })
      .catch(err => console.error('WakaTime fetch error:', err))
      .finally(() => setWakaLoading(false));
  }, []);

  // Build heatmap grid data (28 days, 7 cols × 4 rows)
  const heatmapCells = [];
  if (githubData) {
    const sortedDays = Object.entries(githubData.commitMap)
      .sort((a, b) => a[0].localeCompare(b[0])); // oldest first
    const maxCommits = Math.max(...Object.values(githubData.commitMap), 1);
    sortedDays.forEach(([date, count]) => {
      let level = 0;
      if (count > 0) {
        const ratio = count / maxCommits;
        if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }
      const isToday = date === new Date().toISOString().split('T')[0];
      heatmapCells.push({ date, count, level, isToday });
    });
  }

  // Build donut chart segments
  const donutSegments = [];
  if (wakaData && wakaData.languages.length > 0) {
    let cumOffset = 0;
    wakaData.languages.forEach((lang, i) => {
      const pct = lang.percent || 0;
      donutSegments.push({
        name: lang.name,
        percent: pct,
        color: lang.color || getLangColor(lang.name),
        dashArray: `${pct} ${100 - pct}`,
        dashOffset: 100 - cumOffset + 25, // +25 to start from top
        totalSeconds: lang.totalSeconds,
        delay: i * 0.12,
      });
      cumOffset += pct;
    });
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <section
      id="live-activity"
      ref={sectionRef}
      className={`live-tracker-section ${isVisible ? 'visible' : ''}`}
    >
      {/* Section Header */}
      <div className="live-tracker-header">
        <div className="live-tracker-title">
          <Activity size={22} className="highlight" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Live Work Tracker</h2>
        </div>
        <div className="live-pulse-badge">
          <span className="live-dot" />
          LIVE
        </div>
      </div>

      {/* GitHub Commit Activity */}
      <div className="glass-card tracker-card" style={{ marginBottom: '1.5rem' }}>
        <div className="tracker-card-header">
          <Code2 size={18} className="highlight" />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: 'var(--text-light)' }}>
            GitHub Activity
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginLeft: 'auto' }}>
            Last 28 days
          </span>
        </div>

        {githubLoading ? (
          <div className="tracker-skeleton">
            <div className="shimmer" style={{ height: '120px', borderRadius: '8px' }} />
          </div>
        ) : githubData ? (
          <>
            {/* Day labels + Heatmap grid */}
            <div className="heatmap-wrapper">
              <div className="heatmap-day-labels">
                {dayLabels.map(d => (
                  <span key={d} className="heatmap-day-label">{d}</span>
                ))}
              </div>
              <div className="commit-grid">
                {heatmapCells.map((cell, i) => (
                  <div
                    key={cell.date}
                    className={`commit-cell level-${cell.level} ${cell.isToday ? 'today' : ''}`}
                    title={`${cell.date}: ${cell.count} commit${cell.count !== 1 ? 's' : ''}`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="tracker-stats-row">
              <div className="tracker-stat">
                <Flame size={16} color="var(--primary-color)" />
                <span className="tracker-stat-value">{githubData.totalCommits}</span>
                <span className="tracker-stat-label">commits</span>
              </div>
              <div className="tracker-stat">
                <CalendarDays size={16} color="var(--primary-color)" />
                <span className="tracker-stat-value">{githubData.activeDays}</span>
                <span className="tracker-stat-label">active days</span>
              </div>
              <div className="tracker-stat">
                <Zap size={16} color="var(--primary-color)" />
                <span className="tracker-stat-value">{githubData.currentStreak}</span>
                <span className="tracker-stat-label">day streak</span>
              </div>
            </div>
          </>
        ) : (
          <div className="tracker-empty">
            <p style={{ color: 'var(--text-main)', opacity: 0.6, fontSize: '0.9rem' }}>
              GitHub activity unavailable
            </p>
          </div>
        )}
      </div>

      {/* WakaTime Language Usage */}
      <div className="glass-card tracker-card">
        <div className="tracker-card-header">
          <Clock size={18} className="highlight" />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: 'var(--text-light)' }}>
            Language Usage
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginLeft: 'auto' }}>
            Last 7 days
          </span>
        </div>

        {wakaLoading ? (
          <div className="tracker-skeleton">
            <div className="shimmer" style={{ height: '140px', borderRadius: '8px' }} />
          </div>
        ) : wakaData && wakaData.languages.length > 0 ? (
          <div className="waka-content">
            {/* SVG Donut Chart */}
            <div className="donut-chart-container">
              <svg viewBox="0 0 36 36" className="donut-chart">
                {/* Background circle */}
                <circle
                  cx="18" cy="18" r="14"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                {/* Language segments */}
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="18" cy="18" r="14"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="4"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    strokeLinecap="round"
                    className="donut-segment"
                    style={{ animationDelay: `${seg.delay}s` }}
                  />
                ))}
                {/* Center text */}
                <text x="18" y="17" textAnchor="middle" className="donut-center-text">
                  {wakaData.languages.length}
                </text>
                <text x="18" y="21" textAnchor="middle" className="donut-center-sub">
                  langs
                </text>
              </svg>
            </div>

            {/* Language Legend */}
            <div className="waka-legend">
              {wakaData.languages.slice(0, 6).map((lang, i) => (
                <div key={i} className="waka-legend-item" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span
                    className="waka-legend-dot"
                    style={{ background: lang.color || getLangColor(lang.name) }}
                  />
                  <span className="waka-legend-name">{lang.name}</span>
                  <span className="waka-legend-pct">{lang.percent?.toFixed(1)}%</span>
                  <span className="waka-legend-time">{formatTime(lang.totalSeconds)}</span>
                </div>
              ))}
            </div>

            {/* Total time */}
            {wakaData.totalSeconds > 0 && (
              <div className="waka-total">
                Total: <strong>{formatTime(wakaData.totalSeconds)}</strong> this week
              </div>
            )}
          </div>
        ) : (
          <div className="tracker-empty">
            <p style={{ color: 'var(--text-main)', opacity: 0.6, fontSize: '0.9rem' }}>
              WakaTime data unavailable — install the IDE plugin to track coding activity.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveTracker;
