from decimal import Decimal, InvalidOperation


def validate_symbol(symbol: str) -> str:
    if symbol is None or not str(symbol).strip():
        raise ValueError("Symbol is required.")

    normalized = str(symbol).strip().upper()
    if not normalized.isalnum():
        raise ValueError("Symbol must be alphanumeric only, for example BTCUSDT.")
    return normalized


def validate_side(side: str) -> str:
    if side is None or not str(side).strip():
        raise ValueError("Side is required.")

    normalized = str(side).strip().upper()
    if normalized not in {"BUY", "SELL"}:
        raise ValueError("Side must be BUY or SELL.")
    return normalized


def validate_order_type(order_type: str) -> str:
    if order_type is None or not str(order_type).strip():
        raise ValueError("Order type is required.")

    normalized = str(order_type).strip().upper()
    if normalized not in {"MARKET", "LIMIT", "STOP", "STOP_MARKET"}:
        raise ValueError("Order type must be MARKET, LIMIT, STOP, or STOP_MARKET.")
    return normalized


def _to_positive_decimal(value, field_name: str) -> Decimal:
    if value is None or str(value).strip() == "":
        raise ValueError(f"{field_name} is required.")

    try:
        decimal_value = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError(f"{field_name} must be a valid decimal number.") from None

    if decimal_value <= 0:
        raise ValueError(f"{field_name} must be positive.")
    return decimal_value


def validate_quantity(quantity) -> Decimal:
    return _to_positive_decimal(quantity, "Quantity")


def validate_price(price) -> Decimal:
    return _to_positive_decimal(price, "Price")

