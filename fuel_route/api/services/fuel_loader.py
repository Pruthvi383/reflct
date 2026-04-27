import csv
from pathlib import Path
from typing import Any, Dict, List, Optional

from django.conf import settings


class FuelDataError(Exception):
    pass


_FUEL_STATIONS: Optional[List[Dict[str, Any]]] = None


def _pick_value(row: Dict[str, str], keys: List[str]) -> str:
    for key in keys:
        if key in row and row[key] not in ("", None):
            return str(row[key]).strip()
    return ""


def _parse_float(value: str) -> Optional[float]:
    cleaned = str(value).strip().replace("$", "").replace(",", "")
    if not cleaned:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def _row_to_station(row: Dict[str, str]) -> Optional[Dict[str, Any]]:
    price = _parse_float(
        _pick_value(row, ["Retail Price", "Rack Price", "Price", "price_per_gallon"])
    )
    if price is None:
        return None

    latitude = _parse_float(_pick_value(row, ["Latitude", "Lat", "latitude"]))
    longitude = _parse_float(_pick_value(row, ["Longitude", "Lng", "Lon", "longitude"]))

    station = {
        "station_name": _pick_value(row, ["Truckstop Name", "Station Name", "Name"]) or "Unknown Station",
        "address": _pick_value(row, ["Address", "Street", "Location"]),
        "city": _pick_value(row, ["City"]),
        "state": _pick_value(row, ["State"]),
        "price_per_gallon": price,
        "latitude": latitude,
        "longitude": longitude,
    }

    if latitude is not None and longitude is not None:
        return station

    address_parts = [station["address"], station["city"], station["state"]]
    full_address = ", ".join([part for part in address_parts if part])
    if not full_address:
        return None

    try:
        from .routing import GeocodingError, geocode_location

        station_lat, station_lng = geocode_location(full_address)
    except GeocodingError:
        return None

    station["latitude"] = station_lat
    station["longitude"] = station_lng
    return station


def _load_fuel_csv(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        raise FuelDataError("Fuel price file not found at {0}".format(path))

    stations: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            station = _row_to_station(row)
            if station:
                stations.append(station)

    if not stations:
        raise FuelDataError("No valid fuel stations found in fuel CSV")

    return stations


def warm_fuel_cache(force_reload: bool = False) -> List[Dict[str, Any]]:
    global _FUEL_STATIONS

    if _FUEL_STATIONS is None or force_reload:
        _FUEL_STATIONS = _load_fuel_csv(settings.FUEL_CSV_PATH)
    return _FUEL_STATIONS


def get_fuel_stations() -> List[Dict[str, Any]]:
    return warm_fuel_cache()
