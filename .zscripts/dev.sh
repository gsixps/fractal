#!/bin/bash
# GSP Dev Server with auto-restart
# This script is called by /start.sh at container boot

cd /home/z/my-project

echo "[DEV] Installing dependencies..."
bun install 2>&1 || true

echo "[DEV] Setting up database..."
bun run db:push 2>&1 || true
bun run db:generate 2>&1 || true

echo "[DEV] Seeding database..."
# Seed via API call after server is up (done below)

echo "[DEV] Starting Next.js dev server with auto-restart..."
while true; do
  echo "[DEV] Starting Next.js dev server at $(date)..."
  NODE_OPTIONS="--max-old-space-size=4096" npx next dev -p 3000 2>&1 | tee -a dev.log
  EXIT_CODE=$?
  echo "[DEV] Next.js exited with code $EXIT_CODE at $(date). Restarting in 3s..."
  sleep 3
done
