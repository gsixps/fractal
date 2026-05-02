#!/bin/sh
cd /home/z/my-project

# Load .env.local
if [ -f .env.local ]; then
  . ./.env.local
  export NEXTAUTH_SECRET DATABASE_URL NEXTAUTH_URL
fi

# Force SQLite (no Turso in this container)
export TURSO_DATABASE_URL=""
export TURSO_AUTH_TOKEN=""

# Use production build - single process, fast startup
while true; do
  node .next/standalone/server.js >> dev.log 2>&1
  sleep 3
done
