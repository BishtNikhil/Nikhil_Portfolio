import random
from locust import HttpUser, task, between

class CloudRunStressTester(HttpUser):
    # Wait time between tasks per user
    wait_time = between(1, 3)

    @task
    def check_health(self):
        # Targeting the /api/health endpoint to stress test Cloud Run's CPU/Memory scaling
        # without hitting external APIs (GitHub/Gemini) which would result in immediate bans.
        # Adding random query params to bypass potential Cloud CDN caching.
        self.client.get(
            f"/api/health?cache_buster={random.randint(1, 1000000)}",
            name="/api/health"
        )
