// Matches Exa's documented runtime API
// (https://exa.ai/docs/reference/search). exa-js's TypeScript types are
// out of sync — they list `github`, `tweet`, `linkedin profile` (which the
// server rejects) and omit `people` (which the server accepts). Category
// is cast at the exa.searchAndContents call site to bridge the gap.
export const EXA_CATEGORIES = [
  'company',
  'research paper',
  'news',
  'pdf',
  'personal site',
  'financial report',
  'people',
] as const;
