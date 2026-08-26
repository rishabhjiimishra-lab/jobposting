(() => {
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
