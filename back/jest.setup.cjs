// Provide fallback env vars so env.ts validation passes in CI (no .env present).
// Tests mock all DB repositories, so these dummy values are never used for real connections.
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'test';
