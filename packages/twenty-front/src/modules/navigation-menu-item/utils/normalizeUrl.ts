export const normalizeUrl = (url: string) => {
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
};
