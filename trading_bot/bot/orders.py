import logging
from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Optional

from .validators import (
    validate_order_type,
    validate_price,
    validate_quantity,
    validate_side,
    validate_symbol,
)


LOGGER = logging.getLogger(__name__)


def _decimal_to_str(value: Decimal) -> str:
    return format(value.normalize(), "f")


@dataclass(frozen=True)
class OrderRequest:
    symbol: str
    side: str
    order_type: str
    quantity: Decimal
    price: Optional[Decimal] = None
    stop_price: Optional[Decimal] = None

    def summary(self) -> str:
        parts = [
            f"Symbol: {self.symbol}",
            f"Side: {self.side}",
            f"Type: {self.order_type}",
            f"Quantity: {_decimal_to_str(self.quantity)}",
        ]
        if self.price is not None:
            parts.append(f"Price: {_decimal_to_str(self.price)}")
        if self.stop_price is not None:
            parts.append(f"Stop Price: {_decimal_to_str(self.stop_price)}")
        return "\n".join(parts)


@dataclass(frozen=True)
class OrderResult:
    order_id: Any
    symbol: str
    status: str
    side: str
    order_type: str
    orig_qty: str
    executed_qty: str
    avg_price: str
    raw: dict

    def summary(self) -> str:
        return "\n".join(
            [
                f"Order ID: {self.order_id}",
                f"Symbol: {self.symbol}",
                f"Status: {self.status}",
                f"Side: {self.side}",
                f"Type: {self.order_type}",
                f"Original Quantity: {self.orig_qty}",
                f"Executed Quantity: {self.executed_qty}",
                f"Average Price: {self.avg_price}",
            ]
        )


def build_order_request(
    symbol,
    side,
    order_type,
    quantity,
    price=None,
    stop_price=None,
) -> OrderRequest:
    normalized_symbol = validate_symbol(symbol)
    normalized_side = validate_side(side)
    normalized_type = validate_order_type(order_type)
    normalized_quantity = validate_quantity(quantity)

    normalized_price = validate_price(price) if price is not None else None
    normalized_stop_price = validate_price(stop_price) if stop_price is not None else None

    if normalized_type == "LIMIT" and normalized_price is None:
        raise ValueError("--price is required for LIMIT orders.")
    if normalized_type == "STOP":
        if normalized_price is None:
            raise ValueError("--price is required for STOP orders.")
        if normalized_stop_price is None:
            raise ValueError("--stop-price is required for STOP orders.")
    if normalized_type == "STOP_MARKET" and normalized_stop_price is None:
        raise ValueError("--stop-price is required for STOP_MARKET orders.")

    return OrderRequest(
        symbol=normalized_symbol,
        side=normalized_side,
        order_type=normalized_type,
        quantity=normalized_quantity,
        price=normalized_price,
        stop_price=normalized_stop_price,
    )


def place_order(client, req: OrderRequest) -> OrderResult:
    params = {
        "symbol": req.symbol,
        "side": req.side,
        "type": req.order_type,
        "quantity": _decimal_to_str(req.quantity),
    }

    if req.price is not None:
        params["price"] = _decimal_to_str(req.price)
    if req.stop_price is not None:
        params["stopPrice"] = _decimal_to_str(req.stop_price)
    if req.order_type in {"LIMIT", "STOP"}:
        params["timeInForce"] = "GTC"

    LOGGER.info("Placing order: %s %s %s %s", req.side, req.order_type, params["quantity"], req.symbol)
    raw = client.place_order(**params)
    LOGGER.info("Order response: id=%s status=%s symbol=%s", raw.get("orderId"), raw.get("status"), raw.get("symbol"))

    return OrderResult(
        order_id=raw.get("orderId"),
        symbol=raw.get("symbol", req.symbol),
        status=raw.get("status", "UNKNOWN"),
        side=raw.get("side", req.side),
        order_type=raw.get("type", req.order_type),
        orig_qty=raw.get("origQty", params["quantity"]),
        executed_qty=raw.get("executedQty", "0"),
        avg_price=raw.get("avgPrice", "0"),
        raw=raw,
    )

