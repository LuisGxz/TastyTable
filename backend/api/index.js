// Vercel serverless function → compiled Nest app (built with `nest build`, so
// decorator metadata is preserved, unlike esbuild compiling TS directly).
module.exports = require('../dist/serverless').handler;
