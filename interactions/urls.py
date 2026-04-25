from django.urls import path
from .views import toggle_like, liked_meals

urlpatterns = [
    path("like/", toggle_like),
    path("liked/", liked_meals),
]