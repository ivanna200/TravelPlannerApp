export const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('bs-BA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const formatDateLong = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('bs-BA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

export const formatDateShort = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('bs-BA', {
    day: '2-digit', month: 'short',
  });
};

export const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  return `${formatDate(start)} — ${formatDate(end)}`;
};

export const getDaysBetween = (d1, d2) =>
  Math.ceil((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));

export const getPlanStatus = (startDate, endDate) => {
  const now   = new Date();
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const daysLeft = Math.ceil((start - now) / (1000 * 60 * 60 * 24));

  if (now >= start && now <= end) return { label: 'U toku',   cls: 'badge-success', dot: 'bg-emerald-500' };
  if (now > end)                  return { label: 'Završeno', cls: 'badge-neutral',  dot: 'bg-slate-400'  };
  if (daysLeft === 0)             return { label: 'Danas!',   cls: 'badge-warning',  dot: 'bg-amber-500'  };
  if (daysLeft <= 7)              return { label: `Za ${daysLeft}d`, cls: 'badge-warning', dot: 'bg-amber-500' };
  if (daysLeft <= 30)             return { label: `Za ${daysLeft}d`, cls: 'badge-sky',     dot: 'bg-sky-500'   };
  return                               { label: `Za ${daysLeft}d`, cls: 'badge-primary', dot: 'bg-blue-400'  };
};
