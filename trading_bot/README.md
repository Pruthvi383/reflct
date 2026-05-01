# Binance Futures Testnet Trading Bot

Python 3 trading bot for Binance Futures Testnet USDT-M using direct REST calls with `requests`.

## 1. Project Structure

```text
trading_bot/
├── api/
│   └── index.py
├── bot/
│   ├── __init__.py
│   ├── client.py
│   ├── orders.py
│   ├── validators.py
│   └── logging_config.py
├── cli.py
├── README.md
├── requirements.txt
├── trading_bot.log
└── vercel.json
```

## 2. Setup

Create and activate a virtual environment:

```bash
cd trading_bot
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create Binance Futures Testnet credentials:

1. Open `https://testnet.binancefuture.com`.
2. Sign in with a Binance testnet account.
3. Create an API key and secret from the testnet account dashboard.
4. Export the credentials:

```bash
export BINANCE_API_KEY="your_testnet_api_key"
export BINANCE_API_SECRET="your_testnet_api_secret"
```

## 3. Usage

MARKET buy:

```bash
python cli.py place --symbol BTCUSDT --side BUY --type MARKET --qty 0.001
```

LIMIT sell:

```bash
python cli.py place --symbol BTCUSDT --side SELL --type LIMIT --qty 0.001 --price 98000
```

STOP buy (Stop-Limit):

```bash
python cli.py place --symbol BTCUSDT --side BUY --type STOP --qty 0.001 --price 97000 --stop-price 96500
```

STOP_MARKET sell:

```bash
python cli.py place --symbol BTCUSDT --side SELL --type STOP_MARKET --qty 0.001 --stop-price 94000
```

List open orders:

```bash
python cli.py orders --symbol BTCUSDT
```

Use verbose console logging:

```bash
python cli.py --verbose place --symbol BTCUSDT --side BUY --type MARKET --qty 0.001
```

Use a custom log file:

```bash
python cli.py --log-file logs/testnet.log orders --symbol BTCUSDT
```

Pass credentials explicitly:

```bash
python cli.py --api-key "$BINANCE_API_KEY" --api-secret "$BINANCE_API_SECRET" place --symbol BTCUSDT --side BUY --type MARKET --qty 0.001
```

## 4. Example Terminal Output

```text
  ____  _                              _____     _
 |  _ \(_)_ __   __ _ _ __   ___ ___ |  ___|   | |_ _   _ _ __ ___  ___
 | |_) | | '_ \ / _` | '_ \ / __/ _ \| |_ _____| __| | | | '__/ _ \/ __|
 |  __/| | | | | (_| | | | | (_|  __/|  _|_____| |_| |_| | | |  __/\__ \
 |_|   |_|_| |_|\__,_|_| |_|\___\___||_|        \__|\__,_|_|  \___||___/

============ Order Request ============
Symbol: BTCUSDT
Side: BUY
Type: MARKET
Quantity: 0.001
============ Order Result ============
Order ID: 987654321
Symbol: BTCUSDT
Status: FILLED
Side: BUY
Type: MARKET
Original Quantity: 0.001
Executed Quantity: 0.001
Average Price: 96215.40
✔ Order submitted.
```

## 5. Logging

| Level | Where | Content |
| --- | --- | --- |
| INFO | Console and file | High-level order placement and response events |
| DEBUG | File always, console with `--verbose` | Raw HTTP method, URL, params, signed flag, status, and response body |
| ERROR | Console via CLI failure output | Human-readable validation, API, timeout, and connection failures |

## 6. Error Handling

| Scenario | Behaviour |
| --- | --- |
| Invalid symbol, side, type, quantity, price, or stop price | Raises `ValueError` and CLI prints a red failure message |
| Binance API returns an error body or HTTP 4xx/5xx | Raises `BinanceClientError(code, message)` |
| Request timeout | Raises `TimeoutError` |
| Connection or other request failure | Raises `ConnectionError` |
| Missing API credentials | CLI exits with a red failure message |

## 7. Assumptions

- This bot targets Binance Futures Testnet USDT-M only.
- The default base URL is `https://testnet.binancefuture.com`.
- API keys are testnet keys, not live Binance keys.
- Quantities and prices are validated as positive `Decimal` values, but symbol-specific tick and step sizes are left to Binance API validation.
- `LIMIT` and `STOP` orders use `timeInForce=GTC`.
- `STOP_MARKET` orders send `stopPrice` and no limit `price`.

## 8. Bonus Features Implemented

- [x] STOP (Stop-Limit) order type wired end-to-end
- [x] STOP_MARKET order type wired end-to-end
- [x] Enhanced CLI UX with ANSI colours
- [x] `orders` sub-command for listing open orders
