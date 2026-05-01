import json
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def _send_health(self, include_body=True):
        body = {
            "name": "binance-futures-testnet-trading-bot",
            "status": "ok",
            "message": "CLI trading bot package deployed. Use the repository README for local CLI commands.",
        }
        encoded = json.dumps(body).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        if include_body:
            self.wfile.write(encoded)

    def do_GET(self):
        self._send_health()

    def do_HEAD(self):
        self._send_health(include_body=False)
