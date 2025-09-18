export function fmtSince(iso?: string | null) {
  if (!iso) return '';
  const start = new Date(iso).getTime();

  const sec = Math.floor((Date.now() - start) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ${min}m`;
  const day = Math.floor(hr / 24);
  return `${day}d ${hr}h ${min}m`;
}

