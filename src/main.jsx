import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { categoryLabels, jobs, videos, youtubeChannel } from './data';
import { getJobText, getTimeAgo, pageFromPath } from './utils';
import '../styles.css';

const pages = ['home', 'vlogs', 'jobs', 'about', 'contact'];
const pageHref = { home: 'index.html', vlogs: 'vlogs.html', jobs: 'jobs.html', about: 'about.html', contact: 'contact.html' };
const meta = {
  home: ['Rishabh Mishra | Latest Jobs, Job Experiences & Vlogs', 'Latest job alerts, fresher openings, real job experiences, reviews, and career vlogs by Rishabh Mishra.'],
  vlogs: ['Vlogs | Rishabh Mishra', 'Watch real job experience vlogs, daily routines, salary expectations, and useful career stories.'],
  jobs: ['Jobs | Rishabh Mishra', 'Search private, government, work-from-home, internship, and BPO job openings with filters and details.'],
  about: ['About | Rishabh Mishra', "Learn about Rishabh Mishra's job updates and career experience platform."],
  contact: ['Contact | Rishabh Mishra', 'Contact Rishabh Mishra for job updates, collaborations, and career questions.'],
};

function App() {
  const [page, setPage] = useState(pageFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const [title, description] = meta[page];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [page]);

  const navigate = (nextPage, event, search = '') => {
    event?.preventDefault();
    window.history.pushState({}, '', `${pageHref[nextPage]}${search}`);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header page={page} navigate={navigate} />
      <main>
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'vlogs' && <Vlogs />}
        {page === 'jobs' && <Jobs />}
        {page === 'about' && <About />}
        {page === 'contact' && <Contact />}
      </main>
      <Footer navigate={navigate} homeContact={page === 'home'} />
    </>
  );
}

function Header({ page, navigate }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  const go = (item, event) => {
    setOpen(false);
    navigate(item, event);
  };

  return (
    <header className={`site-header ${open ? 'is-menu-open' : ''}`}>
      <a className="brand" href="index.html" onClick={(event) => go('home', event)} aria-label="Rishabh Mishra home">
        <span className="brand-mark">RM</span>
        <span>Rishabh Mishra</span>
      </a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>
        <span />
        <span />
        <span />
      </button>
      <nav className="nav" id="main-navigation" aria-label="Main navigation">
        {pages.map((item) => (
          <a key={item} href={pageHref[item]} onClick={(event) => go(item, event)} aria-current={page === item ? 'page' : undefined}>
            {item[0].toUpperCase() + item.slice(1)}
          </a>
        ))}
      </nav>
      <a className="subscribe-button" href={youtubeChannel} target="_blank" rel="noreferrer">
        Subscribe
      </a>
    </header>
  );
}

function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      canvas.closest('.hero')?.classList.add('hero--no-webgl');
      return undefined;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true, transparent: true, opacity: 0.45 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.012, 8, 48), new THREE.MeshBasicMaterial({ color: 0x12a6a6, transparent: true, opacity: 0.7 }));
    group.add(mesh, ring);
    scene.add(group);
    camera.position.z = 7;

    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let frameId = 0;
    const animate = (time) => {
      group.rotation.x = time * 0.00018;
      group.rotation.y = time * 0.00028;
      ring.rotation.z = -time * 0.00022;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}

function Home({ navigate }) {
  const latestJobs = useMemo(() => [...jobs].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)).slice(0, 5), []);
  return (
    <>
      <section className="hero" id="home">
        <HeroCanvas />
        <span className="hero-orbit-fallback" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Latest jobs, real experiences, and vlogs</p>
          <h1>Rishabh Mishra</h1>
          <p className="hero-text">Discover current job openings, fresher opportunities, work-from-home roles, government job alerts, and honest workplace experiences that explain the role, expected salary, application process, and day-to-day reality.</p>
          <div className="hero-actions">
            <a className="primary-action" href="jobs.html" onClick={(event) => navigate('jobs', event)}>See Latest Jobs</a>
            <a className="secondary-action" href="vlogs.html" onClick={(event) => navigate('vlogs', event)}>Watch Vlogs</a>
          </div>
          <dl className="stats" aria-label="Channel statistics">
            <div><dt>{jobs.length}+</dt><dd>Openings</dd></div>
            <div><dt>4</dt><dd>Categories</dd></div>
            <div><dt>Free</dt><dd>Updates</dd></div>
          </dl>
        </div>
        <FeaturedVideo />
      </section>
      <section className="job-brief-section" aria-labelledby="job-brief-title">
        <article className="job-brief">
          <p className="eyebrow">Featured job update</p>
          <h2 id="job-brief-title">Cognizant Recruitment Hiring Freshers for Data Analytics (Process Executive) | Any Graduates</h2>
          <time dateTime="2026-08-19">August 19, 2026</time>
          <a className="telegram-cta" href="https://t.me/" target="_blank" rel="noreferrer">Join Our Official Telegram Channel</a>
          <div className="job-brief-visual" role="img" aria-label="Data analytics career opportunity visual"><span>DATA<br />ANALYTICS</span></div>
          <p>Cognizant is hiring freshers for a Process Executive opportunity in the data analytics domain. Explore the role, eligibility, work location, and application details before applying.</p>
          <a className="secondary-action" href="jobs.html?category=private" onClick={(event) => navigate('jobs', event, '?category=private')}>See more jobs</a>
        </article>
        <aside className="job-sidebar" aria-label="Latest jobs">
          <div className="latest-jobs-panel">
            <h3>Latest Jobs</h3>
            <div className="latest-jobs-list">
              {latestJobs.map((job) => (
                <a key={job.title} href={`jobs.html?category=${job.category}`} onClick={(event) => navigate('jobs', event, `?category=${job.category}`)}>
                  <strong>{job.title}</strong>
                  <span>{job.company} | {job.location} | {getTimeAgo(job.postedAt)}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
      <PagePreview navigate={navigate} />
      <VideoSection navigate={navigate} />
      <JobsCta navigate={navigate} />
      <AboutBand />
    </>
  );
}

function FeaturedVideo() {
  return (
    <a className="featured-video" href={videos[0].url} target="_blank" rel="noreferrer" aria-label="Watch featured vlog on YouTube">
      <div className="video-frame" role="img" aria-label="Featured vlog thumbnail from How this job actually feels">
        <div className="play-icon">Play</div>
        <div className="video-meta"><span>Featured Vlog</span><strong>How this job actually feels: latest experience vlog</strong></div>
      </div>
    </a>
  );
}

function PagePreview({ navigate }) {
  const previews = [
    ['vlogs', 'Video', 'Vlogs', 'Real work stories', 'Watch job routines, workplace lessons, and honest experience videos before choosing a role.'],
    ['jobs', 'Jobs', 'Jobs', 'Fresh openings', 'Browse private, government, internship, BPO, and work-from-home opportunities by category.'],
    ['about', 'Info', 'About', 'Clear career context', 'Understand why the platform exists and how it helps job seekers compare opportunities.'],
    ['contact', 'Mail', 'Contact', 'Send updates', 'Share openings, collaboration requests, viewer questions, or useful career resources.'],
  ];
  return (
    <section className="section page-preview-section" aria-labelledby="preview-title">
      <div className="section-heading"><div><p className="eyebrow">Quick tour</p><h2 id="preview-title">Every page has a clear next step.</h2></div></div>
      <div className="page-preview-grid">
        {previews.map(([key, icon, eyebrow, title, text]) => (
          <article className={`page-preview-card preview-${key}`} key={key}>
            <span className="preview-icon" aria-hidden="true">{icon}</span>
            <p className="eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
            <p>{text}</p>
            <a className="text-link" href={pageHref[key]} onClick={(event) => navigate(key, event)}>See more</a>
          </article>
        ))}
      </div>
    </section>
  );
}

function VideoSection({ navigate }) {
  return (
    <section className="section" id="vlogs">
      <div className="section-heading">
        <h2>Real stories from work and life</h2>
        {navigate && <a className="primary-action" href="vlogs.html" onClick={(event) => navigate('vlogs', event)}>See more stories</a>}
      </div>
      <VideoGrid />
    </section>
  );
}

function VideoGrid() {
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <a className="video-card" href={video.url} target="_blank" rel="noreferrer" key={video.title}>
          <div className={`thumbnail ${video.thumbnailClass}`} role="img" aria-label={`${video.title} video thumbnail`}><span>Play</span></div>
          <p className="video-tag">{video.tag}</p>
          <h3>{video.title}</h3>
          {video.description && <p>{video.description}</p>}
        </a>
      ))}
    </div>
  );
}

function YouTubeEmbed({ videoId, title }) {
  return (
    <div className="embed-card">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function JobsCta({ navigate }) {
  return (
    <section className="jobs-band jobs-cta" id="jobs">
      <div>
        <p className="eyebrow">Find your next opportunity</p>
        <h2>Apply for the right job in your domain.</h2>
        <p>Explore curated private, government, work-from-home, and BPO opportunities built for students, freshers, and growing professionals.</p>
        <nav className="job-shortcuts" aria-label="Browse jobs by category">
          {Object.entries(categoryLabels).map(([category, label]) => (
            <a href={`jobs.html?category=${category}`} onClick={(event) => navigate('jobs', event, `?category=${category}`)} key={category}>{label}</a>
          ))}
        </nav>
      </div>
      <a className="primary-action" href="jobs.html" onClick={(event) => navigate('jobs', event)}>See more jobs</a>
    </section>
  );
}

function Jobs() {
  const initialCategory = new URLSearchParams(window.location.search).get('category') || 'all';
  const [filters, setFilters] = useState({
    category: ['all', ...Object.keys(categoryLabels)].includes(initialCategory) ? initialCategory : 'all',
    query: '',
    type: 'all',
    location: 'all',
    experience: 'all',
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const options = useMemo(() => ({
    type: ['all', ...new Set(jobs.map((job) => job.type))],
    location: ['all', ...new Set(jobs.map((job) => job.location))],
    experience: ['all', ...new Set(jobs.map((job) => job.experience))],
  }), []);

  const filteredJobs = jobs.filter((job) => {
    const query = filters.query.trim().toLowerCase();
    return (
      (filters.category === 'all' || job.category === filters.category) &&
      (filters.type === 'all' || job.type === filters.type) &&
      (filters.location === 'all' || job.location === filters.location) &&
      (filters.experience === 'all' || job.experience === filters.experience) &&
      (!query || getJobText(job).includes(query))
    );
  });

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters({ category: 'all', query: '', type: 'all', location: 'all', experience: 'all' });

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Latest jobs 2026</p>
        <h1>Fresh job openings for students and job seekers</h1>
        <p className="page-intro">Browse private opportunities, government technology roles, work-from-home openings, internships, and BPO jobs in one focused place.</p>
      </section>
      <section className="jobs-band jobs-page-band">
        <form className="job-search job-page-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="job-keyword-search">Search jobs by keyword</label>
          <div>
            <input id="job-keyword-search" type="search" placeholder="Search company, role, skill, location..." value={filters.query} onChange={(event) => setFilter('query', event.target.value)} />
            <button type="submit" aria-label="Search jobs">Search</button>
          </div>
          <p className="job-search-message" role="status" aria-live="polite">{resultText(filteredJobs.length)}</p>
        </form>
        <div className="job-filters" id="job-filters">
          <fieldset className="job-filter-group">
            <legend>Browse jobs by category</legend>
            <div className="filter-options">
              {['all', ...Object.keys(categoryLabels)].map((category) => (
                <button type="button" className={`filter-option ${filters.category === category ? 'is-active' : ''}`} aria-pressed={filters.category === category} onClick={() => setFilter('category', category)} key={category}>
                  {category === 'all' ? 'All jobs' : categoryLabels[category].replace(' Jobs', '')}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="select-filter-grid">
            <SelectFilter label="Job type" value={filters.type} options={options.type} onChange={(value) => setFilter('type', value)} />
            <SelectFilter label="Location" value={filters.location} options={options.location} onChange={(value) => setFilter('location', value)} />
            <SelectFilter label="Experience" value={filters.experience} options={options.experience} onChange={(value) => setFilter('experience', value)} />
          </div>
          <div className="filter-summary">
            <p className="filter-message" role="status" aria-live="polite">{resultText(filteredJobs.length)}</p>
            <button type="button" className="reset-button" onClick={resetFilters}>Reset filters</button>
          </div>
        </div>
        <div className="jobs-categories">
          {Object.entries(categoryLabels).map(([category, label]) => {
            const categoryJobs = filteredJobs.filter((job) => job.category === category);
            if (!categoryJobs.length) return null;
            return (
              <div className="job-category" key={category}>
                <h2>{label}</h2>
                <div className="job-list">{categoryJobs.map((job) => <JobCard job={job} onDetails={() => setSelectedJob(job)} key={job.title} />)}</div>
              </div>
            );
          })}
        </div>
        {!filteredJobs.length && <p className="empty-state">No matching jobs right now. Try clearing one filter or searching a broader skill.</p>}
      </section>
      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option value={option} key={option}>{option === 'all' ? `All ${label.toLowerCase()}` : option}</option>)}
      </select>
    </label>
  );
}

function resultText(count) {
  return count ? `${count} job${count === 1 ? '' : 's'} found` : 'No jobs found for this keyword.';
}

function JobCard({ job, onDetails }) {
  return (
    <article className="job-card">
      <div>
        <div className="job-meta-row"><p className="job-type">{job.type}</p><time dateTime={job.postedAt}>{getTimeAgo(job.postedAt)}</time></div>
        <h3>{job.title}</h3>
        <p>{job.company} | {job.location}</p>
      </div>
      <div className="job-facts">
        <span>{job.experience}</span>
        <span>{job.salary}</span>
        <span>{job.deadline}</span>
      </div>
      <ul>{job.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
      <div className="job-actions">
        <button type="button" onClick={onDetails}>View details</button>
        <a href={job.url} target="_blank" rel="noreferrer">Apply</a>
      </div>
    </article>
  );
}

function JobDetailsModal({ job, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <article className="job-modal" role="dialog" aria-modal="true" aria-labelledby="job-modal-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" aria-label="Close job details" onClick={onClose}>Close</button>
        <p className="eyebrow">{categoryLabels[job.category]}</p>
        <h2 id="job-modal-title">{job.title}</h2>
        <p className="modal-company">{job.company} | {job.location}</p>
        <div className="detail-grid">
          <div><span>Experience</span><strong>{job.experience}</strong></div>
          <div><span>Salary</span><strong>{job.salary}</strong></div>
          <div><span>Deadline</span><strong>{job.deadline}</strong></div>
          <div><span>Posted</span><strong>{getTimeAgo(job.postedAt)}</strong></div>
        </div>
        <h3>What to check before applying</h3>
        <ul>{job.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        <div className="apply-note">Verify eligibility, deadline, salary, and the official application page before submitting your form.</div>
        <a className="primary-action" href={job.url} target="_blank" rel="noreferrer">Open official link</a>
      </article>
    </div>
  );
}

function Vlogs() {
  return (
    <>
      <section className="page-hero">
        <h1>Real stories from work and life</h1>
        <p className="page-intro">Honest job reviews, daily routines, salary expectations, and career lessons to help you choose your next opportunity.</p>
      </section>
      <section className="latest-vlog">
        <YouTubeEmbed videoId="hnh0QdBsvkY" title="How this job actually feels" />
        <div className="latest-vlog-copy">
          <p className="eyebrow">Latest video</p>
          <h2>How this job actually feels</h2>
          <p>Watch the latest experience and get a real view of the routine, responsibilities, pressure, and learning that comes with the role.</p>
          <ul className="experience-points"><li>Day-to-day work experience</li><li>Honest challenges and useful lessons</li><li>Practical guidance for freshers</li></ul>
          <a className="primary-action" href={videos[0].url} target="_blank" rel="noreferrer">Watch on YouTube</a>
        </div>
      </section>
      <section className="section">
        <div className="section-heading"><h2>More career videos</h2></div>
        <div className="embed-grid">
          <YouTubeEmbed videoId="DPaKtALadyM" title="A day in my work life" />
          <YouTubeEmbed videoId="hnh0QdBsvkY" title="Real work experience" />
        </div>
      </section>
      <section className="section"><VideoGrid /></section>
    </>
  );
}

function About() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">About this platform</p>
        <h1>Make better career decisions with real information.</h1>
        <p className="page-intro">Rishabh Mishra brings together private job updates, government tech alerts, work-from-home roles, internships, and honest workplace experience vlogs.</p>
      </section>
      <AboutBand page />
      <section className="section faq-section" aria-labelledby="faq-title">
        <p className="eyebrow">Common questions</p>
        <h2 id="faq-title">Career information, made clear.</h2>
        <div className="faq-list">
          <details><summary>What can I find here?</summary><p>Private jobs, government technology alerts, fresher opportunities, work-from-home roles, and real experience vlogs.</p></details>
          <details><summary>Are the job details official?</summary><p>Always verify eligibility, deadlines, salary, and the official application page before applying.</p></details>
          <details><summary>Where can I watch the latest videos?</summary><p>Visit the Vlogs page or follow Rishabh Mishra on the linked YouTube channel.</p></details>
        </div>
      </section>
    </>
  );
}

function AboutBand({ page = false }) {
  return (
    <section className={`about-band ${page ? 'about-page-band' : ''}`} id="about">
      <div className="about-copy">
        <p className="eyebrow">{page ? 'The goal' : 'About this platform'}</p>
        <h2>{page ? 'Understand the opportunity before you join.' : 'Rishabh Mishra helps people find jobs and understand jobs before joining.'}</h2>
        <p>{page ? 'Every opportunity deserves context. This platform shares practical details about eligibility, application steps, expected work, salary, routine, pressure, and growth so students and job seekers can move forward with clarity.' : 'This platform brings together private job updates, government job alerts, work-from-home openings, internships, and honest job experience vlogs. The goal is to help people understand both the opportunity and the real experience before they apply or join.'}</p>
      </div>
      <div className="topics" aria-label="Channel topics">
        {['Vlogs', 'Private Jobs', 'Government Jobs', 'Work From Home', 'Internships', 'Job Reviews', 'Shorts'].map((topic) => <span key={topic}>{topic}</span>)}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Contact</p>
        <h1>Have a job update or a question?</h1>
        <p className="page-intro">Send opportunities, collaboration requests, or viewer questions. Let us make career information easier to find.</p>
      </section>
      <section className="section contact-section">
        <div><p className="eyebrow">Reach out</p><h2>Let's talk about useful work.</h2><p>Recruiters can share openings, viewers can ask job-related questions, and subscribers can follow the latest job alerts and experience vlogs.</p></div>
        <ContactPanel simple />
      </section>
    </>
  );
}

function ContactPanel({ simple = false }) {
  return (
    <div className="contact-panel">
      <a href="mailto:hello@example.com"><span>{simple ? 'Email: hello@example.com' : 'hello@example.com'}</span></a>
      <a href={youtubeChannel} target="_blank" rel="noreferrer"><span>{simple ? 'YouTube Channel' : 'YouTube'}</span></a>
      <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"><span>Instagram</span></a>
      {!simple && <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer"><span>TikTok</span></a>}
      <a href="https://x.com/" target="_blank" rel="noreferrer"><span>X / Twitter</span></a>
    </div>
  );
}

function Footer({ navigate, homeContact }) {
  return (
    <footer className="site-footer" id="contact">
      {homeContact && (
        <section className="footer-contact" aria-labelledby="footer-contact-title">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 id="footer-contact-title">Send job updates, collab requests, or viewer questions</h2>
            <p>Recruiters can share openings, viewers can ask job-related questions, and subscribers can follow Rishabh Mishra for latest job alerts and experience vlogs.</p>
          </div>
          <ContactPanel />
        </section>
      )}
      <span>© 2026 Rishabh Mishra</span>
      <nav className="footer-links" aria-label="Footer navigation">
        {pages.map((item) => <a key={item} href={pageHref[item]} onClick={(event) => navigate(item, event)}>{item[0].toUpperCase() + item.slice(1)}</a>)}
        <a href={youtubeChannel} target="_blank" rel="noreferrer">YouTube</a>
      </nav>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
