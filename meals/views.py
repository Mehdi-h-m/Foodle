from datetime import timedelta
from django.utils import timezone
from django.shortcuts import render
from django.http import JsonResponse
import requests
from .models import DisplayedMeal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


# Create your views here.
@permission_classes([IsAuthenticated])
def Discover(request):
        user = request.user
        meals = []
        cutoff = timezone.now() - timedelta(days=1)

        attempts = 0
        MAX_ATTEMPTS = 50 

        while len(meals) < 25 and attempts < MAX_ATTEMPTS:
            attempts += 1

            response = requests.get('https://www.themealdb.com/api/json/v1/1/random.php')

            if response.status_code != 200:
                continue

            meal_data = response.json()
            meal = meal_data['meals'][0]
            meal_id = int(meal['idMeal'])

            already_shown = DisplayedMeal.objects.filter(
                user=user,
                meal_id=meal_id,
                shown_at__gte=cutoff
            ).exists()

            if not already_shown:
                DisplayedMeal.objects.create(
                    user=user,
                    meal_id=meal_id
                )
                meals.append(meal)

        return JsonResponse({"meals": meals})