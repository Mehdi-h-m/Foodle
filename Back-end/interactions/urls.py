from django.urls import path
from .views import toggle_like, liked_meals, track_view

urlpatterns = [
    path("like/", toggle_like),
    path("liked/", liked_meals),
    path("view/", track_view),
]