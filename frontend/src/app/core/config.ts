// API base — local Nest server in dev, the deployed Vercel API in production.
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE = isLocal
  ? 'http://localhost:3013/api'
  : 'https://tastytable-api.vercel.app/api';
