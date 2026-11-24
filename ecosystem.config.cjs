/**
 * PM2 process file for a VPS deployment:
 *   npm ci && npm run build
 *   pm2 start ecosystem.config.cjs && pm2 save
 *
 * Runs the Next.js server and the outbox worker side by side. Both read .env.local
 * (or real environment variables set on the host).
 */
module.exports = {
  apps: [
    {
      name: "npe-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: { NODE_ENV: "production" },
      max_memory_restart: "600M",
    },
    {
      name: "npe-outbox-worker",
      script: "scripts/outbox-worker.mjs",
      node_args: "--env-file-if-exists=.env.local",
      env: { NODE_ENV: "production", OUTBOX_WORKER_URL: "http://127.0.0.1:3000" },
      restart_delay: 5000,
    },
  ],
};
