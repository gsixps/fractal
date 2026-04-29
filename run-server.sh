#!/bin/bash
# 3GSP Keepalive Server Script
cd /home/z/my-project

while true; do
  echo "[$(date)] Starting standalone server..."
  node .next/standalone/server.js -p 3000 >> /home/z/my-project/dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
