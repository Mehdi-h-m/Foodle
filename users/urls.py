from django.urls import path,include
from .views import register
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', register, name="register"),
    path('login/', TokenObtainPairView.as_view(),name="login"),
    path('refresh/', TokenRefreshView.as_view(), name="refresh"),
]