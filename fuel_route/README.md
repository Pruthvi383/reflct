# Fuel Route API

Production-oriented Django REST API for planning a US road trip and selecting cost-efficient fuel stops along the route.

## File Tree

```text
fuel_route/
├── manage.py
├── requirements.txt
├── .env.example
├── fuel_route/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/
│   ├── __init__.py
│   ├── apps.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   ├── views.py
│   └── services/
│       ├── __init__.py
│       ├── fuel_loader.py
│       ├── optimizer.py
│       └── routing.py
└── data/
    └── fuel_prices.csv
```

## Features

- Accepts `start` and `end` US locations through a REST endpoint.
- Geocodes both locations using OpenRouteService.
- Calls the OpenRouteService directions API once per request.
- Loads the fuel CSV only once into module-level memory.
- Matches stations within a 10-mile corridor around the route using a custom haversine implementation.
- Uses a greedy optimizer to choose the cheapest reachable stop while favoring later stops near the 400-500 mile mark.

## Setup

1. Clone the repository and open the Django project directory:

   ```bash
   cd fuel_route
   ```

2. Create and activate a virtual environment:

   ```bash
   python3.11 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

5. Add your OpenRouteService API key to `.env`.

6. Start the server:

   ```bash
   python manage.py runserver
   ```

## Getting a Free OpenRouteService API Key

1. Go to [https://openrouteservice.org/](https://openrouteservice.org/).
2. Create a free account.
3. Generate an API key from the dashboard.
4. Paste the key into `.env` as `ORS_API_KEY=...`.

No credit card is required for the free tier.

## API Endpoint

### `POST /api/route/`

Request body:

```json
{
  "start": "New York, NY",
  "end": "Los Angeles, CA"
}
```

Example success response:

```json
{
  "route_summary": {
    "total_distance_miles": 2789.4,
    "total_duration_hours": 40.2
  },
  "fuel_stops": [
    {
      "stop_number": 1,
      "station_name": "Pilot Travel Center",
      "address": "123 Main St, Columbus, OH",
      "price_per_gallon": 3.45,
      "miles_from_previous_stop": 487.0,
      "gallons_needed": 48.7,
      "cost_at_this_stop": 168.02
    }
  ],
  "total_fuel_cost": 842.5,
  "total_gallons": 278.9,
  "map_url": "https://maps.openrouteservice.org/#/directions/..."
}
```

## Postman Testing

Use:

- Method: `POST`
- URL: `http://127.0.0.1:8000/api/route/`
- Header: `Content-Type: application/json`

Body:

```json
{
  "start": "Chicago, IL",
  "end": "Denver, CO"
}
```

## Fuel Optimization Algorithm

The optimizer uses these constants:

- Vehicle range: `500 miles`
- MPG: `10`
- Tank capacity: `50 gallons`

Flow:

1. Start with a full tank.
2. Find route stations inside the next reachable mileage window.
3. Pick the lowest-priced reachable station.
4. If there is a tie, prefer stations farther along the route, especially near the 400-500 mile mark.
5. Drive to that station, compute consumed fuel, refill to a full tank, and continue.
6. Stop once the destination is within the remaining range.

## Fuel Data Notes

- A sample `data/fuel_prices.csv` is included so the API runs immediately.
- Replace it with the provided file if you have a richer dataset.
- Supported pricing columns include `Retail Price`, `Rack Price`, or `Price`.
- If coordinates are missing and the address is present, the loader attempts to geocode the station once while warming the in-memory cache.

## Error Handling

Examples:

```json
{"error": "Could not geocode location: 'Fakeville, ZZ'"}
```

```json
{"error": "No fuel stations found along this route"}
```

```json
{"error": "Routing API failed: 503 Server Error"}
```

## Known Limitations

- The included CSV is a sample dataset, not a nationwide live fuel feed.
- OpenRouteService free-tier rate limits still apply.
- Station proximity is approximated against route geometry points rather than a road-network snap.
- The starting full tank is assumed to be free, so total trip fuel usage and total purchased fuel cost are reported separately.

## Improvements With More Time

- Add a faster spatial index for large nationwide fuel datasets.
- Persist cached geocoded stations to a preprocessed artifact.
- Add async job support for batch route comparisons.
- Add observability, structured logging, and request-level metrics.
- Expand automated tests with more edge cases and mocked upstream failure scenarios.
