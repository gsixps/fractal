#!/bin/bash
while true; do
  echo "[$(date)] Starting dev server..."
  NODE_OPTIONS="--max-old-space-size=4096" npx next dev -p 3000 2>&1 | tee -a dev.log
  echo "[$(date)] Dev server exited, restarting in 3s..."
  sleep 3
done
