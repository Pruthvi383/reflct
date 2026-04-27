from typing import Dict, List, Tuple

import requests
from django.conf import settings


class RoutingServiceError(Exception):
    pass


class GeocodingError(Exception):
    pass


ORS_BASE_URL = "https://api.openrouteservice.org"
REQUEST_TIMEOUT_SECONDS = 12


def _get_headers() -> Dict[str, str]:
    if not settings.ORS_API_KEY:
        raise RoutingServiceError("ORS_API_KEY is not configured")

    return {
        "Authorization": settings.ORS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json, application/geo+json",
    }


def geocode_location(query: str) -> Tuple[float, float]:
    if not query.strip():
        raise GeocodingError("Could not geocode location: '{0}'".format(query))

    params = {
        "api_key": settings.ORS_API_KEY,
        "text": query,
        "boundary.country": "USA",
        "size": 1,
    }

    try:
        response = requests.get(
            "{0}/geocode/search".format(ORS_BASE_URL),
            params=params,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise GeocodingError("Could not geocode location: '{0}'".format(query)) from exc

    payload = response.json()
    features = payload.get("features") or []
    if not features:
        raise GeocodingError("Could not geocode location: '{0}'".format(query))

    coordinates = features[0]["geometry"]["coordinates"]
    longitude, latitude = coordinates
    return latitude, longitude


def build_map_url(start_coords: Tuple[float, float], end_coords: Tuple[float, float]) -> str:
    start_lat, start_lng = start_coords
    end_lat, end_lng = end_coords
    return (
        "https://maps.openrouteservice.org/#/directions/"
        "{0},{1}/{2},{3}/data".format(start_lng, start_lat, end_lng, end_lat)
    )


def get_route(
    start_coords: Tuple[float, float],
    end_coords: Tuple[float, float],
) -> Dict[str, object]:
    start_lat, start_lng = start_coords
    end_lat, end_lng = end_coords
    payload = {
        "coordinates": [
            [start_lng, start_lat],
            [end_lng, end_lat],
        ]
    }

    try:
        response = requests.post(
            "{0}/v2/directions/driving-car/geojson".format(ORS_BASE_URL),
            headers=_get_headers(),
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RoutingServiceError(str(exc)) from exc

    body = response.json()
    features = body.get("features") or []
    if not features:
        raise RoutingServiceError("No route returned by OpenRouteService")

    route_feature = features[0]
    geometry = route_feature.get("geometry", {}).get("coordinates") or []
    summary = route_feature.get("properties", {}).get("summary", {})

    if not geometry:
        raise RoutingServiceError("Route geometry missing from OpenRouteService response")

    distance_meters = float(summary.get("distance", 0.0))
    duration_seconds = float(summary.get("duration", 0.0))

    return {
        "geometry": geometry,
        "total_distance_miles": distance_meters * 0.000621371,
        "total_duration_hours": duration_seconds / 3600,
        "map_url": build_map_url(start_coords, end_coords),
    }
