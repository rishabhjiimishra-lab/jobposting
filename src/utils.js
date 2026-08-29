export const getTimeAgo = (dateValue) => {
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

export const getJobText = (job) =>
  [job.title, job.company, job.category, job.type, job.location, ...job.details].join(' ').toLowerCase();

export const pageFromPath = (pathname) => {
  const cleanPath = pathname.replace(/\/$/, '');
  if (cleanPath.endsWith('/vlogs') || cleanPath.endsWith('/vlogs.html')) return 'vlogs';
  if (cleanPath.endsWith('/jobs') || cleanPath.endsWith('/jobs.html')) return 'jobs';
  if (cleanPath.endsWith('/about') || cleanPath.endsWith('/about.html')) return 'about';
  if (cleanPath.endsWith('/contact') || cleanPath.endsWith('/contact.html')) return 'contact';
  return 'home';
};

export const isValidExternalUrl = (value) => /^https?:\/\//.test(value);
