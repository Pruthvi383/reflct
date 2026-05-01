import hashlib
import hmac
import logging
import time
from urllib.parse import urlencode

import requests


LOGGER = logging.getLogger(__name__)
DEFAULT_BASE_URL = "https://testnet.binancefuture.com"


class BinanceClientError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(f"Binance API error {code}: {message}")


class BinanceClient:
    def __init__(self, api_key, api_secret, base_url=DEFAULT_BASE_URL):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"X-MBX-APIKEY": api_key})

    def _sign(self, params):
        query = urlencode(params, doseq=True)
        return hmac.new(
            self.api_secret.encode("utf-8"),
            query.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    def _request(self, method, path, params=None, signed=False):
        params = dict(params or {})
        if signed:
            params.setdefault("timestamp", int(time.time() * 1000))
            params["signature"] = self._sign(params)

        url = f"{self.base_url}{path}"
        method = method.upper()
        LOGGER.debug("HTTP %s %s params=%s signed=%s", method, url, params, signed)

        try:
            response = self.session.request(
                method,
                url,
                params=params if method in {"GET", "DELETE"} else None,
                data=params if method not in {"GET", "DELETE"} else None,
                timeout=10,
            )
        except requests.exceptions.Timeout as exc:
            LOGGER.debug("HTTP %s %s timed out: %s", method, url, exc)
            raise TimeoutError(f"Request timed out: {exc}") from exc
        except requests.exceptions.ConnectionError as exc:
            LOGGER.debug("HTTP %s %s connection failed: %s", method, url, exc)
            raise ConnectionError(f"Connection failed: {exc}") from exc
        except requests.exceptions.RequestException as exc:
            LOGGER.debug("HTTP %s %s network failure: %s", method, url, exc)
            raise ConnectionError(f"Network request failed: {exc}") from exc

        LOGGER.debug(
            "HTTP %s %s response status=%s body=%s",
            method,
            url,
            response.status_code,
            response.text,
        )

        try:
            body = response.json()
        except ValueError:
            body = {"code": response.status_code, "msg": response.text}

        if response.status_code >= 400 or (
            isinstance(body, dict) and body.get("code", 0) < 0
        ):
            code = body.get("code", response.status_code) if isinstance(body, dict) else response.status_code
            message = body.get("msg", response.text) if isinstance(body, dict) else response.text
            raise BinanceClientError(code, message)

        return body

    def place_order(self, **kwargs):
        return self._request("POST", "/fapi/v1/order", params=kwargs, signed=True)

    def get_open_orders(self, symbol=None):
        params = {"symbol": symbol} if symbol else {}
        return self._request("GET", "/fapi/v1/openOrders", params=params, signed=True)

    def cancel_order(self, symbol, order_id):
        params = {"symbol": symbol, "orderId": order_id}
        return self._request("DELETE", "/fapi/v1/order", params=params, signed=True)

    def get_symbol_info(self, symbol):
        data = self._request("GET", "/fapi/v1/exchangeInfo", signed=False)
        for item in data.get("symbols", []):
            if item.get("symbol") == symbol:
                return item
        raise BinanceClientError(-1121, f"Invalid symbol: {symbol}")

