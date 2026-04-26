import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This repo has lockfiles at the monorepo root and under `frontend/`. Without
  // an explicit root, Turbopack can pick the parent lockfile and fail to resolve
  // `next` (especially on Linux CI / Vercel). Pin the app root to this folder.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
