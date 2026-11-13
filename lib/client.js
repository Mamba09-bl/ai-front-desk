import Redis from "ioredis";

// Upstash in production; REDIS_URL lives in .env.local locally and in Vercel's env settings.
const client = new Redis(process.env.REDIS_URL);

export default client;
