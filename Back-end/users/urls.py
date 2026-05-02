from django.urls import path,include
from .views import register, login
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', register, name="register"),
    path('login/', login,name="login"),
    path('refresh/', TokenRefreshView.as_view(), name="refresh"),
]