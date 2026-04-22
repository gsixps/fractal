#!/usr/bin/env python3
"""Dev server keepalive - runs as daemon and restarts Next.js on crash"""
import subprocess
import time
import os
import signal
import sys

def main():
    os.chdir('/home/z/my-project')
    log_path = '/home/z/my-project/dev.log'
    
    while True:
        try:
            with open(log_path, 'a') as log:
                log.write(f"\n[watchdog] Starting Next.js dev server at {time.strftime('%H:%M:%S')}...\n")
                log.flush()
            
            proc = subprocess.Popen(
                ['npx', 'next', 'dev', '-p', '3000'],
                stdout=open(log_path, 'a'),
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                env={**os.environ, 'NODE_OPTIONS': '--max-old-space-size=4096'},
                start_new_session=True,
            )
            
            with open(log_path, 'a') as log:
                log.write(f"[watchdog] Next.js started with PID {proc.pid}\n")
                log.flush()
            
            # Wait for process to exit
            returncode = proc.wait()
            
            with open(log_path, 'a') as log:
                log.write(f"[watchdog] Next.js exited with code {returncode} at {time.strftime('%H:%M:%S')}. Restarting in 3s...\n")
                log.flush()
            
            time.sleep(3)
        except Exception as e:
            with open(log_path, 'a') as log:
                log.write(f"[watchdog] Error: {e}\n")
                log.flush()
            time.sleep(5)

if __name__ == '__main__':
    # Ignore SIGHUP
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    main()
