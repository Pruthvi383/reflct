from django.http import JsonResponse
from django.urls import include, path


def healthcheck(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("", healthcheck, name="healthcheck"),
    path("api/", include("api.urls")),
]
