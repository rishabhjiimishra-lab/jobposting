export const getTimeAgo = (dateValue) => {
  const diffMs = Date.now() - new Date(dateValue).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 60000) return 'Just now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
};

export const isValidExternalUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
};

export const isJobCurrent = (job, now = new Date()) => {
  const addedAt = new Date(job.postedAt);
  const ageInDays = (now.getTime() - addedAt.getTime()) / 86400000;
  if (!Number.isFinite(ageInDays) || ageInDays < 0 || ageInDays > 14 || !isValidExternalUrl(job.url)) return false;

  const deadlineMatch = job.deadline.match(/^(\d{1,2}\s+[A-Za-z]+\s+\d{4})$/);
  if (!deadlineMatch) return true;

  const deadline = new Date(deadlineMatch[1]);
  deadline.setHours(23, 59, 59, 999);
  return Number.isFinite(deadline.getTime()) && deadline >= now;
};

export const getDeadlineLabel = (deadline) =>
  /^apply soon$/i.test(deadline) ? 'Not specified — check source' : deadline;

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
