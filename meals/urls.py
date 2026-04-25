from django.contrib import admin
from django.urls import path,include
from meals import views
urlpatterns = [
    path('Discover/', views.Discover, name="Discover"),
    path("search/", views.search_meals, name="search_meals"),
]