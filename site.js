(() => {
  const setupJobFilters = () => {
    const jobsBand = document.querySelector('.jobs-band');
    if (!jobsBand) return;

    const form = document.querySelector('#job-filters') || (() => {
      const createdForm = document.createElement('form');
      createdForm.className = 'job-filters';
      createdForm.id = 'job-filters';
      createdForm.noValidate = true;
      createdForm.innerHTML = '<label for="job-filter">Filter jobs</label><select id="job-filter" name="job-filter"><option value="all">All jobs</option><option value="private">Private</option><option value="government">Government</option><option value="work-from-home">Work From Home</option><option value="bpo">BPO</option></select><p class="filter-message" id="filter-message" role="status" aria-live="polite"></p>';
      jobsBand.insertBefore(createdForm, jobsBand.querySelector('.jobs-categories'));
      return createdForm;
    })();
    const select = form.querySelector('select');
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

    const applyFilter = () => {
      const value = select.value;
      if (!['all', 'private', 'government', 'work-from-home', 'bpo'].includes(value)) {
        select.setCustomValidity('Please select a valid job category.');
        message.textContent = 'Please select a valid job category.';
        return;
      }
      select.setCustomValidity('');
      let visible = 0;
      cards.forEach((card) => {
        const show = value === 'all' || card.dataset.jobCategory.split(' ').includes(value);
        card.hidden = !show;
        if (show) visible += 1;
      });
      message.textContent = visible ? `${visible} job${visible === 1 ? '' : 's'} found` : 'No jobs found in this category.';
    };

    select.addEventListener('change', applyFilter);
    form.addEventListener('submit', (event) => event.preventDefault());
    applyFilter();
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
