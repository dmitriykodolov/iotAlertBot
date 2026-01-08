#!/usr/bin/env python3

import logging
import os
import time

import ngrok

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)

# Optional: set auth token from environment to avoid auth errors.
ngrok_token = os.environ.get("NGROK_AUTHTOKEN") or os.environ.get("NGROK_TOKEN")
if ngrok_token:
    if hasattr(ngrok, "set_auth_token"):
        ngrok.set_auth_token(ngrok_token)
    elif hasattr(ngrok, "authtoken"):
        ngrok.authtoken(ngrok_token)
else:
    logging.warning("NGROK_AUTHTOKEN is not set; ngrok may fail authentication.")

listener = ngrok.forward(8000, proto="http")
listener_url = getattr(listener, "url", None)
logging.info("ngrok forwarding to http://localhost:8000 -> %s", listener_url)

try:
    logging.info("Tunnel is up. Press Ctrl+C to stop.")
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    logging.info("Shutting down tunnel...")
    if listener_url:
        ngrok.disconnect(listener_url)
    else:
        ngrok.disconnect()
    ngrok.kill()
    logging.info("Tunnel stopped cleanly.")

if __name__ == "__main__":
    pass
