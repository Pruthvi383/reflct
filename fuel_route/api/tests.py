from unittest.mock import patch

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from .serializers import RouteRequestSerializer
from .services.routing import GeocodingError
from .services.optimizer import annotate_route_geometry, match_stations_to_route, select_optimal_fuel_stops


class RouteRequestSerializerTests(SimpleTestCase):
    def test_requires_start_and_end(self):
        serializer = RouteRequestSerializer(data={"start": "New York, NY"})
        self.assertFalse(serializer.is_valid())
        self.assertIn("end", serializer.errors)


class OptimizerServiceTests(SimpleTestCase):
    def test_selects_cheapest_reachable_station(self):
        route_geometry = [
            [-74.0, 40.0],
            [-73.0, 40.0],
            [-72.0, 40.0],
            [-71.0, 40.0],
            [-70.0, 40.0],
            [-69.0, 40.0],
        ]
        route_points = annotate_route_geometry(route_geometry)
        stations = [
            {
                "station_name": "Expensive Fuel",
                "address": "101 Route Rd",
                "city": "A",
                "state": "AA",
                "price_per_gallon": 4.50,
                "latitude": 40.0,
                "longitude": -71.0,
            },
            {
                "station_name": "Cheap Fuel",
                "address": "202 Route Rd",
                "city": "B",
                "state": "BB",
                "price_per_gallon": 3.25,
                "latitude": 40.0,
                "longitude": -70.0,
            },
        ]
        matched = match_stations_to_route(route_points, stations, corridor_miles=15)
        result = select_optimal_fuel_stops(total_distance_miles=520, route_stations=matched)

        self.assertEqual(len(result["fuel_stops"]), 1)
        self.assertEqual(result["fuel_stops"][0]["station_name"], "Cheap Fuel")


class RouteApiTests(SimpleTestCase):
    client_class = APIClient

    @patch("api.views.get_fuel_stations")
    @patch("api.views.select_optimal_fuel_stops")
    @patch("api.views.match_stations_to_route")
    @patch("api.views.annotate_route_geometry")
    @patch("api.views.get_route")
    @patch("api.views.geocode_location")
    def test_route_endpoint_success(
        self,
        mock_geocode,
        mock_get_route,
        mock_annotate_route_geometry,
        mock_match_stations_to_route,
        mock_select_optimal_fuel_stops,
        mock_get_fuel_stations,
    ):
        mock_geocode.side_effect = [(40.7128, -74.0060), (34.0522, -118.2437)]
        mock_get_route.return_value = {
            "geometry": [[-74.0060, 40.7128], [-118.2437, 34.0522]],
            "total_distance_miles": 2789.4,
            "total_duration_hours": 40.2,
            "map_url": "https://maps.openrouteservice.org/example",
        }
        mock_annotate_route_geometry.return_value = [{"lat": 40.7, "lng": -74.0, "mile_marker": 0.0}]
        mock_get_fuel_stations.return_value = [{"station_name": "Test Fuel"}]
        mock_match_stations_to_route.return_value = [{"station_name": "Test Fuel", "mile_marker": 450.0}]
        mock_select_optimal_fuel_stops.return_value = {
            "fuel_stops": [
                {
                    "stop_number": 1,
                    "station_name": "Test Fuel",
                    "address": "123 Main St, Columbus, OH",
                    "price_per_gallon": 3.45,
                    "miles_from_previous_stop": 450.0,
                    "gallons_needed": 45.0,
                    "cost_at_this_stop": 155.25,
                }
            ],
            "total_fuel_cost": 842.5,
            "total_gallons": 278.9,
        }

        response = self.client.post(
            "/api/route/",
            {"start": "New York, NY", "end": "Los Angeles, CA"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["fuel_stops"][0]["station_name"], "Test Fuel")

    @patch("api.views.geocode_location")
    def test_route_endpoint_geocode_error(self, mock_geocode):
        mock_geocode.side_effect = GeocodingError("Could not geocode location: 'Fakeville, ZZ'")
        response = self.client.post(
            "/api/route/",
            {"start": "Fakeville, ZZ", "end": "Los Angeles, CA"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
