import logging

from django.apps import AppConfig


logger = logging.getLogger(__name__)


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self) -> None:
        from .services.fuel_loader import warm_fuel_cache

        try:
            warm_fuel_cache()
        except Exception as exc:  # pragma: no cover - startup safety net
            logger.warning("Fuel cache warmup skipped: %s", exc)
