import math
from typing import Any, Dict, List

from django.conf import settings


VEHICLE_RANGE_MILES = 500
MPG = 10
TANK_CAPACITY = VEHICLE_RANGE_MILES / MPG


class OptimizationError(Exception):
    pass


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_miles = 3958.8
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * radius_miles * math.asin(math.sqrt(a))


def annotate_route_geometry(route_geometry: List[List[float]]) -> List[Dict[str, float]]:
    if not route_geometry:
        raise OptimizationError("Route geometry is empty")

    route_points: List[Dict[str, float]] = []
    cumulative_miles = 0.0

    for index, coordinate in enumerate(route_geometry):
        longitude, latitude = coordinate
        if index > 0:
            previous = route_points[index - 1]
            cumulative_miles += haversine(
                previous["lat"],
                previous["lng"],
                latitude,
                longitude,
            )
        route_points.append(
            {
                "lat": latitude,
                "lng": longitude,
                "mile_marker": cumulative_miles,
            }
        )

    return route_points


def match_stations_to_route(
    route_points: List[Dict[str, float]],
    stations: List[Dict[str, Any]],
    corridor_miles: float = None,
) -> List[Dict[str, Any]]:
    if corridor_miles is None:
        corridor_miles = float(settings.ROUTE_CORRIDOR_MILES)

    matched_stations: List[Dict[str, Any]] = []

    for station in stations:
        station_lat = station["latitude"]
        station_lng = station["longitude"]
        nearest_distance = None
        nearest_mile_marker = 0.0

        for route_point in route_points:
            distance = haversine(
                station_lat,
                station_lng,
                route_point["lat"],
                route_point["lng"],
            )
            if nearest_distance is None or distance < nearest_distance:
                nearest_distance = distance
                nearest_mile_marker = route_point["mile_marker"]

        if nearest_distance is not None and nearest_distance <= corridor_miles:
            station_copy = dict(station)
            station_copy["mile_marker"] = nearest_mile_marker
            station_copy["distance_to_route"] = nearest_distance
            matched_stations.append(station_copy)

    matched_stations.sort(key=lambda station: station["mile_marker"])
    return matched_stations


def _pick_next_station(
    reachable_stations: List[Dict[str, Any]],
    current_mile: float,
    current_range_remaining: float,
) -> Dict[str, Any]:
    range_end = current_mile + current_range_remaining
    preferred_window_start = max(current_mile + 400, current_mile)

    return min(
        reachable_stations,
        key=lambda station: (
            station["price_per_gallon"],
            0 if station["mile_marker"] >= preferred_window_start else 1,
            abs(range_end - station["mile_marker"]),
            -station["mile_marker"],
        ),
    )


def select_optimal_fuel_stops(
    total_distance_miles: float,
    route_stations: List[Dict[str, Any]],
) -> Dict[str, Any]:
    if total_distance_miles <= VEHICLE_RANGE_MILES:
        return {
            "fuel_stops": [],
            "total_fuel_cost": 0.0,
            "total_gallons": total_distance_miles / MPG,
        }

    if not route_stations:
        raise OptimizationError("No fuel stations found along this route")

    fuel_stops: List[Dict[str, Any]] = []
    total_fuel_cost = 0.0
    total_gallons = total_distance_miles / MPG
    current_mile = 0.0
    previous_stop_mile = 0.0
    gallons_remaining = TANK_CAPACITY
    stop_number = 1

    while total_distance_miles - current_mile > gallons_remaining * MPG:
        current_range_remaining = gallons_remaining * MPG
        reachable_stations = [
            station
            for station in route_stations
            if current_mile < station["mile_marker"] <= current_mile + current_range_remaining
        ]

        if not reachable_stations:
            raise OptimizationError(
                "No reachable fuel stations found within {0} miles of the current position".format(
                    round(current_range_remaining, 1)
                )
            )

        next_station = _pick_next_station(
            reachable_stations=reachable_stations,
            current_mile=current_mile,
            current_range_remaining=current_range_remaining,
        )

        miles_since_last_stop = next_station["mile_marker"] - current_mile
        gallons_used = miles_since_last_stop / MPG
        gallons_remaining = max(gallons_remaining - gallons_used, 0.0)
        gallons_needed = TANK_CAPACITY - gallons_remaining
        stop_cost = gallons_needed * next_station["price_per_gallon"]

        fuel_stops.append(
            {
                "stop_number": stop_number,
                "station_name": next_station["station_name"],
                "address": ", ".join(
                    [
                        value
                        for value in [
                            next_station.get("address", ""),
                            next_station.get("city", ""),
                            next_station.get("state", ""),
                        ]
                        if value
                    ]
                ),
                "price_per_gallon": round(next_station["price_per_gallon"], 2),
                "miles_from_previous_stop": round(next_station["mile_marker"] - previous_stop_mile, 1),
                "gallons_needed": round(gallons_needed, 1),
                "cost_at_this_stop": round(stop_cost, 2),
            }
        )

        total_fuel_cost += stop_cost
        current_mile = next_station["mile_marker"]
        previous_stop_mile = current_mile
        gallons_remaining = TANK_CAPACITY
        stop_number += 1

    return {
        "fuel_stops": fuel_stops,
        "total_fuel_cost": total_fuel_cost,
        "total_gallons": total_gallons,
    }
