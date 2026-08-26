(() => {
  const jobs = [
    {
      title: 'JPMC Data Analyst - AML/KYC Operations',
      company: 'JPMorgan Chase & Co.',
      category: 'private',
      type: 'Full Time',
      location: 'India',
      postedAt: '2026-08-26T14:15:00+05:30',
      details: [
        'Domain: Banking and financial services with AML/KYC operations support',
        'Role: Data analysis, client onboarding, risk review, and compliance checks',
        'Skills: Excel, research, problem solving, reporting, and attention to detail',
      ],
      url: 'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/210780424?keyword=Data+Analyst&location=India&locationId=300000000289360&locationLevel=country&mode=location',
    },
    {
      title: 'Cognizant Data Analytics Process Executive',
      company: 'Cognizant',
      category: 'private',
      type: 'Full Time',
      location: 'India',
      postedAt: '2026-08-26T10:30:00+05:30',
      details: ['Qualification: Any graduate or fresher', 'Skills: Excel, reporting, data analytics basics', 'Role: Process Executive'],
      url: 'https://www.youtube.com/@Tech_bhaiyaji',
    },
    {
      title: 'Customer Support Executive',
      company: 'Company Name',
      category: 'work-from-home',
      type: 'Full Time',
      location: 'Remote / Work from home',
      postedAt: '2026-08-26T08:15:00+05:30',
      details: ['Qualification: 12th pass, graduate, or fresher', 'Skills: Communication, email support, basic computer', 'Salary: Add expected salary here'],
      url: 'https://www.youtube.com/@Tech_bhaiyaji',
    },
    {
      title: 'Social Media Intern',
      company: 'Company Name',
      category: 'private',
      type: 'Internship',
      location: 'Delhi / Hybrid',
      postedAt: '2026-08-25T18:45:00+05:30',
      details: ['Qualification: Student, fresher, or career starter', 'Skills: Instagram, Canva, basic editing', 'Last date: Add application deadline'],
      url: 'https://www.youtube.com/@Tech_bhaiyaji',
    },
    {
      title: 'Government IT Job Alert for Freshers',
      company: 'Department Name',
      category: 'government',
      type: 'Government',
      location: 'India',
      postedAt: '2026-08-25T12:00:00+05:30',
      details: ['Qualification: Add official eligibility here', 'Age limit: Add details here', 'Last date: Add application deadline'],
      url: 'https://www.youtube.com/@Tech_bhaiyaji',
    },
    {
      title: 'BPO Support Associate',
      company: 'Hiring Partner',
      category: 'bpo',
      type: 'BPO',
      location: 'Noida / Gurugram',
      postedAt: '2026-08-24T20:30:00+05:30',
      details: ['Qualification: 12th pass or graduate', 'Skills: Voice process, customer handling', 'Shift: Rotational'],
      url: 'https://www.youtube.com/@Tech_bhaiyaji',
    },
  ];

  const categoryLabels = {
    private: 'Private Jobs',
    government: 'Government Tech Jobs',
    'work-from-home': 'Work From Home Jobs',
    bpo: 'BPO Jobs',
  };

  const getTimeAgo = (dateValue) => {
    const diffMs = Date.now() - new Date(dateValue).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  };

  const getJobText = (job) => [job.title, job.company, job.category, job.type, job.location, ...job.details].join(' ').toLowerCase();

  const renderLatestJobs = () => {
    const list = document.querySelector('.latest-jobs-list');
    if (!list) return;
    list.innerHTML = jobs
      .slice()
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
      .slice(0, 5)
      .map((job) => `<a href="jobs.html?category=${job.category}" data-job-search="${getJobText(job)}"><strong>${job.title}</strong><span>${job.company} · ${job.location} · ${getTimeAgo(job.postedAt)}</span></a>`)
      .join('');
  };

  const renderJobsPage = () => {
    const container = document.querySelector('[data-jobs-list]');
    if (!container) return;
    container.innerHTML = Object.entries(categoryLabels)
      .map(([category, label]) => {
        const cards = jobs
          .filter((job) => job.category === category)
          .map((job) => `<article class="job-card" data-job-category="${job.category}" data-job-search="${getJobText(job)}"><div><div class="job-meta-row"><p class="job-type">${job.type}</p><time datetime="${job.postedAt}">${getTimeAgo(job.postedAt)}</time></div><h3>${job.title}</h3><p>${job.company} · ${job.location}</p></div><ul>${job.details.map((detail) => `<li>${detail}</li>`).join('')}</ul><a href="${job.url}" target="_blank" rel="noreferrer">Apply / Details</a></article>`)
          .join('');
        return `<div class="job-category"><h2>${label}</h2><div class="job-list">${cards}</div></div>`;
      })
      .join('');
  };

  renderLatestJobs();
  renderJobsPage();

  const setupJobFilters = () => {
    const jobsBand = document.querySelector('.jobs-band');
    const categoriesContainer = jobsBand?.querySelector('.jobs-categories');
    if (!jobsBand || !categoriesContainer) return;

    const searchForm = document.querySelector('.job-page-search, .job-search');
    const searchInput = searchForm?.querySelector('input');
    const searchMessage = searchForm?.querySelector('.job-search-message');
    const form = document.querySelector('#job-filters') || (() => {
      const createdForm = document.createElement('form');
      createdForm.className = 'job-filters';
      createdForm.id = 'job-filters';
      createdForm.noValidate = true;
      createdForm.innerHTML = '<fieldset class="job-filter-group"><legend>Browse jobs by category</legend><div class="filter-options"><button type="button" class="filter-option is-active" data-filter="all">All jobs</button><button type="button" class="filter-option" data-filter="private">Private</button><button type="button" class="filter-option" data-filter="government">Government</button><button type="button" class="filter-option" data-filter="work-from-home">Work From Home</button><button type="button" class="filter-option" data-filter="bpo">BPO</button></div></fieldset><p class="filter-message" id="filter-message" role="status" aria-live="polite"></p>';
      jobsBand.insertBefore(createdForm, categoriesContainer);
      return createdForm;
    })();
    const options = [...form.querySelectorAll('[data-filter]')];
    const message = form.querySelector('.filter-message');
    const cards = [...jobsBand.querySelectorAll('.job-card')];

    cards.forEach((card) => {
      if (card.dataset.jobCategory) return;
      const text = card.textContent.toLowerCase();
      const categories = text.includes('government') ? ['government'] : ['private'];
      if (text.includes('remote') || text.includes('work from home')) categories.push('work-from-home');
      if (text.includes('customer support') || text.includes('bpo')) categories.push('bpo');
      card.dataset.jobCategory = categories.join(' ');
    });

    let currentFilter = 'all';
    let currentQuery = '';

    const applyFilter = (value = currentFilter) => {
      if (!['all', 'private', 'government', 'work-from-home', 'bpo'].includes(value)) {
        message.textContent = 'Please select a valid job category.';
        return;
      }
      currentFilter = value;
      options.forEach((option) => {
        const active = option.dataset.filter === value;
        option.classList.toggle('is-active', active);
        option.setAttribute('aria-pressed', String(active));
      });
      let visible = 0;
      cards.forEach((card) => {
        const categoryMatch = value === 'all' || card.dataset.jobCategory.split(' ').includes(value);
        const keywordMatch = !currentQuery || card.dataset.jobSearch.includes(currentQuery);
        const show = categoryMatch && keywordMatch;
        card.hidden = !show;
        if (show) visible += 1;
      });
      categoriesContainer.querySelectorAll('.job-category').forEach((category) => {
        category.hidden = ![...category.querySelectorAll('.job-card')].some((card) => !card.hidden);
      });
      const foundText = visible ? `${visible} job${visible === 1 ? '' : 's'} found` : 'No jobs found for this keyword.';
      message.textContent = foundText;
      if (searchMessage) searchMessage.textContent = foundText;
    };

    options.forEach((option) => option.addEventListener('click', () => applyFilter(option.dataset.filter)));
    form.addEventListener('submit', (event) => event.preventDefault());
    searchInput?.addEventListener('input', () => {
      currentQuery = searchInput.value.trim().toLowerCase();
      applyFilter(currentFilter);
    });
    searchForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      currentQuery = searchInput.value.trim().toLowerCase();
      applyFilter(currentFilter);
    });
    const requestedFilter = new URLSearchParams(window.location.search).get('category');
    applyFilter(['all', 'private', 'government', 'work-from-home', 'bpo'].includes(requestedFilter) ? requestedFilter : 'all');
  };

  setupJobFilters();

  const setupHomeJobSearch = () => {
    const form = document.querySelector('.job-sidebar .job-search');
    if (!form) return;
    const input = form.querySelector('input');
    const message = form.querySelector('.job-search-message');
    const links = [...document.querySelectorAll('.latest-jobs-list a')];
    const search = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      links.forEach((job) => {
        const match = !query || job.dataset.jobSearch.includes(query);
        job.hidden = !match;
        if (match) visible += 1;
      });
      message.textContent = visible ? `${visible} latest job${visible === 1 ? '' : 's'} found` : 'No matching jobs found.';
    };
    input.addEventListener('input', search);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      search();
    });
    search();
  };

  setupHomeJobSearch();

  const canvas = document.querySelector('.hero-canvas');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canvas || !window.THREE || reduceMotion) {
    return;
  }

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (error) {
    canvas.closest('.hero')?.classList.add('hero--no-webgl');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const group = new THREE.Group();
  const shape = new THREE.IcosahedronGeometry(1.7, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0033, wireframe: true, transparent: true, opacity: 0.45 });
  const mesh = new THREE.Mesh(shape, material);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.25, 0.012, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0x12a6a6, transparent: true, opacity: 0.7 })
  );

  group.add(mesh, ring);
  scene.add(group);
  camera.position.z = 7;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const animate = (time) => {
    group.rotation.x = time * 0.00018;
    group.rotation.y = time * 0.00028;
    ring.rotation.z = -time * 0.00022;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
})();
