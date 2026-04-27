from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RouteRequestSerializer
from .services.fuel_loader import FuelDataError, get_fuel_stations
from .services.optimizer import (
    OptimizationError,
    annotate_route_geometry,
    match_stations_to_route,
    select_optimal_fuel_stops,
)
from .services.routing import GeocodingError, RoutingServiceError, geocode_location, get_route


class RouteOptimizerView(APIView):
    def post(self, request):
        serializer = RouteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start = serializer.validated_data["start"]
        end = serializer.validated_data["end"]

        try:
            start_coords = geocode_location(start)
            end_coords = geocode_location(end)
        except GeocodingError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            route_data = get_route(start_coords, end_coords)
        except RoutingServiceError as exc:
            return Response(
                {"error": "Routing API failed: {0}".format(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            stations = get_fuel_stations()
            route_points = annotate_route_geometry(route_data["geometry"])
            route_stations = match_stations_to_route(route_points, stations)

            if not route_stations:
                return Response(
                    {"error": "No fuel stations found along this route"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            optimization = select_optimal_fuel_stops(
                total_distance_miles=route_data["total_distance_miles"],
                route_stations=route_stations,
            )
        except FuelDataError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except OptimizationError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        response_payload = {
            "route_summary": {
                "total_distance_miles": round(route_data["total_distance_miles"], 1),
                "total_duration_hours": round(route_data["total_duration_hours"], 1),
            },
            "fuel_stops": optimization["fuel_stops"],
            "total_fuel_cost": round(optimization["total_fuel_cost"], 2),
            "total_gallons": round(optimization["total_gallons"], 1),
            "map_url": route_data["map_url"],
        }
        return Response(response_payload, status=status.HTTP_200_OK)
