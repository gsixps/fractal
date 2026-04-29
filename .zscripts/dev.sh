#!/bin/sh
cd /home/z/my-project
while true; do TURSO_DATABASE_URL="" TURSO_AUTH_TOKEN="" bun run dev >> dev.log 2>&1; sleep 3; done
