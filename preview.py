"""Start a local HTTP preview for the VANTA GitHub Pages folder."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


ROOT = Path(__file__).resolve().parent
URL = "http://127.0.0.1:4179/index.html"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


server = ThreadingHTTPServer(("127.0.0.1", 4179), Handler)
print(f"VANTA preview: {URL} (press Ctrl+C here to stop)", flush=True)
webbrowser.open(URL)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nVANTA preview stopped.")
finally:
    server.server_close()
