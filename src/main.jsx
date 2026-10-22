import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { categoryLabels, jobs, videos, youtubeChannel } from './data';
import { getDeadlineLabel, getJobText, getTimeAgo, isJobCurrent, pageFromPath } from './utils';
import '../styles.css';

const pages = ['home', 'vlogs', 'jobs', 'about', 'contact'];
const pageHref = { home: '/', vlogs: '/vlogs', jobs: '/jobs', about: '/about', contact: '/contact' };
const meta = {
  home: ['Rishabh Mishra | Latest Jobs, Job Experiences & Vlogs', 'Recent job listings with source links and career and fresher-guidance videos by Rishabh Mishra.'],
  vlogs: ['Vlogs | Rishabh Mishra', 'Watch career-update and fresher-guidance videos by Rishabh Mishra.'],
  jobs: ['Jobs | Rishabh Mishra', 'Browse recent job listings with source links, clear deadline and salary caveats, and practical checks before applying.'],
  about: ['About | Rishabh Mishra', 'Learn who maintains this independent job directory, how listings are summarized, and how to report corrections.'],
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
      <WhatsAppAssistantButton />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

function WhatsAppAssistantButton() {
  const phoneNumber = '918355006498';
  const message = encodeURIComponent('Hi, I want to know more about the latest job updates and career guidance.');

  return (
    <a
      className="assistant-fab"
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <span className="assistant-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M20.52 3.48A11.07 11.07 0 0 0 12.1 1C6.37 1 1.7 5.66 1.7 11.39c0 1.98.53 3.92 1.52 5.62L1.5 22.5l5.63-1.71c1.67.9 3.58 1.38 5.54 1.38h.02c5.72 0 10.38-4.66 10.38-10.38 0-2.77-1.08-5.36-3.05-7.31ZM12.1 19.4h-.02c-1.7 0-3.37-.46-4.82-1.32l-.35-.2-3.34 1.02 1.12-3.25-.23-.37A8.52 8.52 0 0 1 3.72 11.4c0-4.72 3.84-8.56 8.57-8.56 2.29 0 4.44.9 6.06 2.52A8.52 8.52 0 0 1 20.67 11.4c0 4.73-3.83 8.57-8.57 8.57Zm5.08-6.43c-.28-.14-1.66-.82-1.92-.91-.26-.09-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.18-.44-2.26-1.4-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.18-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.35-.01-.54-.01-.19 0-.49.07-.75.35-.26.28-1 .98-1 2.39 0 1.4 1.02 2.77 1.16 2.96.14.19 2.01 3.08 4.87 4.32.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.11.55-.08 1.66-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.12-.26-.19-.54-.34Z" fill="currentColor"/>
        </svg>
      </span>
    </a>
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
      <a className="brand" href="/" onClick={(event) => go('home', event)} aria-label="Rishabh Mishra home">
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

    let cleanup = () => {};
    let cancelled = false;
    const start = async () => {
      const THREE = await import('three');
      if (cancelled) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        canvas.closest('.hero')?.classList.add('hero--no-webgl');
        return;
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

      cleanup = () => {
        cancelAnimationFrame(frameId);
        observer.disconnect();
        renderer.dispose();
      };
    };

    const idleId = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 300);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}

function Home({ navigate }) {
  const currentJobs = useMemo(
    () => jobs.filter((job) => isJobCurrent(job)).sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)),
    []
  );
  const latestJobs = currentJobs.slice(0, 5);
  const featuredJob = latestJobs[0];
  return (
    <>
      <section className="hero" id="home">
        <HeroCanvas />
        <span className="hero-orbit-fallback" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Latest jobs, real experiences, and vlogs</p>
          <h1>Rishabh Mishra</h1>
          <p className="hero-text">Browse recent job listings and career videos. Each job entry links to its source so you can confirm the employer's current requirements, pay, and application deadline before taking action.</p>
          <div className="hero-actions">
            <a className="primary-action" href="/jobs" onClick={(event) => navigate('jobs', event)}>See Latest Jobs</a>
            <a className="secondary-action" href="/vlogs" onClick={(event) => navigate('vlogs', event)}>Watch Vlogs</a>
          </div>
          <dl className="stats" aria-label="Channel statistics">
            <div><dt>{currentJobs.length}</dt><dd>Current listings</dd></div>
            <div><dt>{new Set(currentJobs.map((job) => job.category)).size}</dt><dd>Categories with listings</dd></div>
            <div><dt>Free</dt><dd>To browse</dd></div>
          </dl>
        </div>
        <FeaturedVideo />
      </section>
      <section className="job-brief-section" aria-labelledby="job-brief-title">
        {featuredJob ? (
          <article className="job-brief">
            <p className="eyebrow">Recently listed opportunity</p>
            <h2 id="job-brief-title">{featuredJob.title}</h2>
            <time dateTime={featuredJob.postedAt}>Added {getTimeAgo(featuredJob.postedAt)}</time>
            <p>{featuredJob.company} · {featuredJob.location} · {featuredJob.experience}</p>
            <p>Review the listing source for current eligibility, compensation, and application dates. Details on this site are a summary and may change.</p>
            <div className="hero-actions">
              <a className="primary-action" href={featuredJob.url} target="_blank" rel="noreferrer">View source listing</a>
              <a className="secondary-action" href="/jobs" onClick={(event) => navigate('jobs', event)}>Browse all listings</a>
            </div>
          </article>
        ) : (
          <article className="job-brief">
            <p className="eyebrow">Job listings</p>
            <h2 id="job-brief-title">No current listings are available.</h2>
            <p>Check back after new opportunities have been reviewed and added.</p>
          </article>
        )}
        <aside className="job-sidebar" aria-label="Latest jobs">
          <div className="latest-jobs-panel">
            <h3>Recently listed</h3>
            {latestJobs.length ? (
              <div className="latest-jobs-list">
                {latestJobs.map((job) => (
                  <a key={job.title} href={`/jobs?category=${job.category}`} onClick={(event) => navigate('jobs', event, `?category=${job.category}`)}>
                    <strong>{job.title}</strong>
                    <span>{job.company} | {job.location} | Added {getTimeAgo(job.postedAt)}</span>
                  </a>
                ))}
              </div>
            ) : <p>No current listings. Please check again later.</p>}
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
  const featuredVideo = videos[0];

  return (
    <div className="featured-video" aria-label={`Featured vlog: ${featuredVideo.title}`}>
      <YouTubeEmbed videoId={getYouTubeVideoId(featuredVideo.url)} title={featuredVideo.title} />
      <div className="video-meta"><span>Featured Vlog</span><strong>{featuredVideo.title}</strong></div>
    </div>
  );
}

function PagePreview({ navigate }) {
  const previews = [
    ['vlogs', 'Video', 'Vlogs', 'Career and fresher videos', 'Watch career-update and fresher-guidance videos from the linked YouTube channel.'],
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
        {navigate && <a className="primary-action" href="/vlogs" onClick={(event) => navigate('vlogs', event)}>See more stories</a>}
      </div>
      <VideoGrid />
    </section>
  );
}

function VideoGrid() {
  return (
    <div className="video-grid">
      {videos.map((video, index) => (
        <a className="video-card" href={video.url} target="_blank" rel="noreferrer" key={video.title}>
          <div className={`thumbnail ${video.thumbnailClass}`} role="img" aria-label={`${video.title} video thumbnail`}>
            <span>{index === 0 ? 'Latest' : 'Watch'}</span>
          </div>
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

function getYouTubeVideoId(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtu.be')) return parsedUrl.pathname.slice(1);
    return parsedUrl.searchParams.get('v') || parsedUrl.pathname.split('/').filter(Boolean).pop() || '';
  } catch {
    return '';
  }
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
            <a href={`/jobs?category=${category}`} onClick={(event) => navigate('jobs', event, `?category=${category}`)} key={category}>{label}</a>
          ))}
        </nav>
      </div>
      <a className="primary-action" href="/jobs" onClick={(event) => navigate('jobs', event)}>See more jobs</a>
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

  const sortedJobs = useMemo(
    () => jobs.filter((job) => isJobCurrent(job)).sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)),
    []
  );

  const filteredJobs = sortedJobs.filter((job) => {
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
        <p className="eyebrow">Job directory · {sortedJobs.length} current listings</p>
        <h1>Job listings with source links and practical checks</h1>
        <p className="page-intro">Browse recent private, government, remote, internship, and BPO listings. Each entry links to its source; confirm availability and every requirement there before applying.</p>
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
      <JobSeekerGuide />
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
  const sourceHost = new URL(job.url).hostname.replace(/^www\./, '');

  return (
    <article className="job-card">
      <div>
        <div className="job-meta-row"><p className="job-type">{job.type}</p><time dateTime={job.postedAt}>Added {getTimeAgo(job.postedAt)}</time></div>
        <h3>{job.title}</h3>
        <p>{job.company} | {job.location}</p>
      </div>
      <div className="job-facts">
        <span>{job.experience}</span>
        <span>{job.salary}</span>
        <span>{getDeadlineLabel(job.deadline)}</span>
      </div>
      <ul>{job.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
      <div className="job-actions">
        <button type="button" onClick={onDetails}>View details</button>
        <a href={job.url} target="_blank" rel="noreferrer">View source · {sourceHost}</a>
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
          <div><span>Deadline</span><strong>{getDeadlineLabel(job.deadline)}</strong></div>
          <div><span>Added here</span><strong>{getTimeAgo(job.postedAt)}</strong></div>
        </div>
        <h3>Details included in this listing</h3>
        <ul>{job.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        <div className="apply-note">This site is an independent directory, not the employer. Pay and deadline information may be estimates or unavailable. Confirm the role, requirements, and application status on the source page before sharing personal information.</div>
        <a className="primary-action" href={job.url} target="_blank" rel="noreferrer">Open source listing</a>
      </article>
    </div>
  );
}

function JobSeekerGuide() {
  return (
    <section className="section job-seeker-guide" aria-labelledby="job-guide-title">
      <p className="eyebrow">A safer application process</p>
      <h2 id="job-guide-title">A three-step check before you apply</h2>
      <div className="guide-grid">
        <article>
          <h3>1. Confirm the listing</h3>
          <p>Open the source link and match the employer, exact role title, location, job ID, and application page. A listing on a job board is not the same as confirmation from the employer.</p>
        </article>
        <article>
          <h3>2. Check the requirements</h3>
          <p>Read the original eligibility, experience, work arrangement, shift, pay, and closing date. Treat “not specified” and estimated salary as unknown until the employer confirms them.</p>
        </article>
        <article>
          <h3>3. Protect your information</h3>
          <p>Do not pay a recruiter to secure an interview or offer. Never disclose passwords, one-time passcodes, card PINs, or online-banking credentials during recruitment.</p>
        </article>
      </div>
      <div className="directory-note">
        <h3>How to use this directory</h3>
        <p>We provide a short summary and a link to the page where the opportunity was listed. The source is authoritative: roles can close without notice, and pay or eligibility details can change. Listings are removed from this page after 14 days or when a stated deadline passes; that timing does not certify that a role is still open.</p>
        <p>Found an inaccurate or closed listing? Email <a href="mailto:rishabhjiimishra@gmail.com">rishabhjiimishra@gmail.com</a> with the job title and source link so it can be reviewed.</p>
      </div>
    </section>
  );
}

function Vlogs() {
  const featuredVideo = videos[0];
  const moreVideos = videos.slice(1);
  const vlogStats = [
    [String(videos.length), 'Videos listed'],
    ['Free', 'To watch'],
    ['YouTube', 'Video host'],
  ];

  return (
    <>
      <section className="page-hero vlogs-hero">
        <div className="vlogs-hero-copy">
          <p className="eyebrow">Career stories & real experience</p>
          <h1>Vlogs that make career choices feel clear.</h1>
          <p className="page-intro">Watch the career-update and fresher-guidance videos listed here. Job details and application requirements should always be confirmed with the linked employer or source.</p>
          <dl className="vlog-stats" aria-label="Vlog highlights">
            {vlogStats.map(([value, label]) => (
              <div key={label}><dt>{value}</dt><dd>{label}</dd></div>
            ))}
          </dl>
        </div>
        <a className="vlogs-hero-preview" href={featuredVideo.url} target="_blank" rel="noreferrer" aria-label={`Watch ${featuredVideo.title}`}>
          <div className={`vlogs-preview-frame ${featuredVideo.thumbnailClass}`}>
            <span className="vlogs-preview-play">Play</span>
            <span className="vlogs-preview-label">Featured video</span>
          </div>
          <strong>{featuredVideo.title}</strong>
        </a>
      </section>

      <section className="vlogs-shell">
        <article className="vlogs-featured" aria-label="Featured vlog">
          <div className="vlogs-featured-video">
            <YouTubeEmbed videoId={getYouTubeVideoId(featuredVideo.url)} title={featuredVideo.title} />
          </div>
          <div className="vlogs-featured-copy">
            <p className="eyebrow">Featured video</p>
            <h2>{featuredVideo.title}</h2>
            <p>{featuredVideo.description}</p>
            <div className="vlog-note">This video is hosted on YouTube. Use the job directory for source links and application checks.</div>
            <div className="vlogs-featured-actions">
              <a className="primary-action" href={featuredVideo.url} target="_blank" rel="noreferrer">Watch on YouTube</a>
              <a className="secondary-action" href={youtubeChannel} target="_blank" rel="noreferrer">Visit channel</a>
            </div>
          </div>
        </article>
      </section>

      {moreVideos.length > 0 && <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">More from the channel</p>
            <h2>Another video</h2>
          </div>
        </div>
        <div className="vlogs-grid">
          {moreVideos.map((video) => (
            <article className="vlog-card" key={video.title}>
              <div className="vlog-card-media">
                <YouTubeEmbed videoId={getYouTubeVideoId(video.url)} title={video.title} />
              </div>
              <div className="vlog-card-copy">
                <p className="video-tag">{video.tag}</p>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <a href={video.url} target="_blank" rel="noreferrer">Watch on YouTube</a>
              </div>
            </article>
          ))}
        </div>
      </section>}
    </>
  );
}

function About() {
  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">About this platform</p>
        <h1>Make better career decisions with real information.</h1>
        <p className="page-intro">Rishabh Mishra maintains an independent directory of recent private, government, remote, internship, and BPO job listings, alongside career and fresher-guidance videos.</p>
      </section>
      <AboutBand page />
      <section className="section editorial-standards" aria-labelledby="editorial-title">
        <p className="eyebrow">Editorial standards</p>
        <h2 id="editorial-title">Who publishes these updates and how to use them</h2>
        <div className="editorial-copy">
          <p>This independent site is maintained by Rishabh Mishra. Job entries are summaries with a link to the page where the opportunity was listed; this site is not an employer, recruiter, or hiring agent.</p>
          <p>We avoid filling in missing facts: when a deadline is not provided, the entry says so; compensation may be an estimate. The employer or linked source is authoritative, and openings can change or close without notice.</p>
          <p>Listings are removed after 14 days from being added here or after a stated closing date. This is a freshness limit, not a real-time check. Please <a href="mailto:rishabhjiimishra@gmail.com">email a correction</a> with the job title and source link if you spot an error.</p>
        </div>
      </section>
      <section className="section faq-section" aria-labelledby="faq-title">
        <p className="eyebrow">Common questions</p>
        <h2 id="faq-title">Career information, made clear.</h2>
        <div className="faq-list">
          <details><summary>What can I find here?</summary><p>Private jobs, government technology alerts, fresher opportunities, work-from-home roles, and real experience vlogs.</p></details>
          <details><summary>Are the listings confirmed by employers?</summary><p>No. This independent directory summarizes public listings and links to their source. Confirm the employer, role, eligibility, pay, deadline, and current status on the source page before applying.</p></details>
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
        <p>{page ? 'The directory summarizes selected opportunities and links to the source page for current requirements and application details. Career and fresher-guidance videos provide a separate view of job-related topics; they are not a substitute for an employer’s official information.' : 'Browse recent job listings, source links, practical application-safety guidance, and career videos. Confirm the details of each opportunity with its employer or linked source before applying.'}</p>
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
      <a href="mailto:rishabhjiimishra@gmail.com"><span>{simple ? 'Email: rishabhjiimishra@gmail.com' : 'rishabhjiimishra@gmail.com'}</span></a>
      <a href={youtubeChannel} target="_blank" rel="noreferrer"><span>{simple ? 'YouTube Channel' : 'YouTube'}</span></a>
      <a href="https://www.instagram.com/_rishabh_ji_007/" target="_blank" rel="noreferrer"><span>Instagram</span></a>
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
      <span>&copy; 2026 Rishabh Mishra</span>
      <nav className="footer-links" aria-label="Footer navigation">
        {pages.map((item) => <a key={item} href={pageHref[item]} onClick={(event) => navigate(item, event)}>{item[0].toUpperCase() + item.slice(1)}</a>)}
        <a href={youtubeChannel} target="_blank" rel="noreferrer">YouTube</a>
      </nav>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
