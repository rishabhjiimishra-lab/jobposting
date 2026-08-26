(() => {
  const setupHomeJobSearch = () => {
    const form = document.querySelector('.job-search');
    if (!form) return;
    const input = form.querySelector('input');
    const message = form.querySelector('.job-search-message');
    const jobs = [...document.querySelectorAll('.latest-jobs-panel a')];
    const search = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      jobs.forEach((job) => {
        const match = !query || job.textContent.toLowerCase().includes(query);
        job.hidden = !match;
        if (match) visible += 1;
      });
      message.textContent = query && !visible ? 'No matching jobs found.' : '';
    };
    input.addEventListener('input', search);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      search();
    });
  };

  setupHomeJobSearch();

  const setupJobFilters = () => {
    const jobsBand = document.querySelector('.jobs-band');
    const categoriesContainer = jobsBand?.querySelector('.jobs-categories');
    if (!jobsBand || !categoriesContainer) return;

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

    const applyFilter = (value = 'all') => {
      if (!['all', 'private', 'government', 'work-from-home', 'bpo'].includes(value)) {
        message.textContent = 'Please select a valid job category.';
        return;
      }
      options.forEach((option) => {
        const active = option.dataset.filter === value;
        option.classList.toggle('is-active', active);
        option.setAttribute('aria-pressed', String(active));
      });
      let visible = 0;
      cards.forEach((card) => {
        const show = value === 'all' || card.dataset.jobCategory.split(' ').includes(value);
        card.hidden = !show;
        if (show) visible += 1;
      });
      categoriesContainer.querySelectorAll('.job-category').forEach((category) => {
        category.hidden = ![...category.querySelectorAll('.job-card')].some((card) => !card.hidden);
      });
      message.textContent = visible ? `${visible} job${visible === 1 ? '' : 's'} found` : 'No jobs found in this category.';
    };

    options.forEach((option) => option.addEventListener('click', () => applyFilter(option.dataset.filter)));
    form.addEventListener('submit', (event) => event.preventDefault());
    const requestedFilter = new URLSearchParams(window.location.search).get('category');
    applyFilter(['all', 'private', 'government', 'work-from-home', 'bpo'].includes(requestedFilter) ? requestedFilter : 'all');
  };

  setupJobFilters();

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
