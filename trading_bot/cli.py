import argparse
import os
import sys

from bot.client import BinanceClient, BinanceClientError, DEFAULT_BASE_URL
from bot.logging_config import setup_logging
from bot.orders import build_order_request, place_order
from bot.validators import validate_symbol


GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
CYAN = "\033[36m"
BOLD = "\033[1m"
RESET = "\033[0m"

BANNER = r"""
  ____  _                              _____     _
 |  _ \(_)_ __   __ _ _ __   ___ ___ |  ___|   | |_ _   _ _ __ ___  ___
 | |_) | | '_ \ / _` | '_ \ / __/ _ \| |_ _____| __| | | | '__/ _ \/ __|
 |  __/| | | | | (_| | | | | (_|  __/|  _|_____| |_| |_| | | |  __/\__ \
 |_|   |_|_| |_|\__,_|_| |_|\___\___||_|        \__|\__,_|_|  \___||___/
"""


def section(title: str) -> None:
    print(f"{CYAN}{BOLD}{'=' * 12} {title} {'=' * 12}{RESET}")


def success(msg: str) -> None:
    print(f"{GREEN}✔ {msg}{RESET}")


def failure(msg: str) -> None:
    print(f"{RED}✘ {msg}{RESET}")
    sys.exit(1)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Binance Futures Testnet trading bot for USDT-M futures."
    )
    parser.add_argument("--api-key", default=os.getenv("BINANCE_API_KEY"))
    parser.add_argument("--api-secret", default=os.getenv("BINANCE_API_SECRET"))
    parser.add_argument("--log-file", default="trading_bot.log")
    parser.add_argument("--verbose", action="store_true")

    subparsers = parser.add_subparsers(dest="command", required=True)

    place = subparsers.add_parser("place", help="Place a futures order")
    place.add_argument("--symbol", required=True)
    place.add_argument("--side", required=True, choices=["BUY", "SELL"])
    place.add_argument(
        "--type",
        required=True,
        choices=["MARKET", "LIMIT", "STOP", "STOP_MARKET"],
        dest="order_type",
    )
    place.add_argument("--qty", required=True)
    place.add_argument("--price")
    place.add_argument("--stop-price")

    orders = subparsers.add_parser("orders", help="List open futures orders")
    orders.add_argument("--symbol")

    return parser


def _require_credentials(args) -> None:
    if not args.api_key:
        failure("Missing API key. Pass --api-key or set BINANCE_API_KEY.")
    if not args.api_secret:
        failure("Missing API secret. Pass --api-secret or set BINANCE_API_SECRET.")


def _handle_place(client, args) -> None:
    try:
        req = build_order_request(
            args.symbol,
            args.side,
            args.order_type,
            args.qty,
            price=args.price,
            stop_price=args.stop_price,
        )
    except ValueError as exc:
        failure(str(exc))

    section("Order Request")
    print(req.summary())

    try:
        result = place_order(client, req)
    except (BinanceClientError, ConnectionError, TimeoutError) as exc:
        failure(str(exc))

    section("Order Result")
    print(result.summary())
    success("Order submitted.")


def _handle_orders(client, args) -> None:
    symbol = None
    if args.symbol:
        try:
            symbol = validate_symbol(args.symbol)
        except ValueError as exc:
            failure(str(exc))

    try:
        open_orders = client.get_open_orders(symbol)
    except (BinanceClientError, ConnectionError, TimeoutError) as exc:
        failure(str(exc))

    section("Open Orders")
    if not open_orders:
        print(f"{YELLOW}No open orders found.{RESET}")
        return

    for item in open_orders:
        print(
            f"{BOLD}{item.get('symbol')}{RESET} "
            f"{item.get('side')} {item.get('type')} "
            f"qty={item.get('origQty')} price={item.get('price')} "
            f"stop={item.get('stopPrice')} status={item.get('status')} "
            f"id={item.get('orderId')}"
        )


def main(argv=None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)
    setup_logging(args.log_file, args.verbose)

    print(f"{CYAN}{BANNER}{RESET}")
    _require_credentials(args)

    client = BinanceClient(args.api_key, args.api_secret, DEFAULT_BASE_URL)
    if args.command == "place":
        _handle_place(client, args)
    elif args.command == "orders":
        _handle_orders(client, args)


if __name__ == "__main__":
    main()

