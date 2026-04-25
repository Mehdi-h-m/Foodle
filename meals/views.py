from datetime import timedelta
from django.utils import timezone
from django.shortcuts import render
from django.http import JsonResponse
import requests
from .models import DisplayedMeal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


BASE_URL = "https://www.themealdb.com/api/json/v1/1"

@api_view(["Get"])
@permission_classes([IsAuthenticated])
def Discover(request):
        user = request.user
        meals = []
        cutoff = timezone.now() - timedelta(days=1)

        attempts = 0
        MAX_ATTEMPTS = 50 

        while len(meals) < 25 and attempts < MAX_ATTEMPTS:
            attempts += 1

            response = requests.get(f"{BASE_URL}/random.php")

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

@api_view(["Get"])
@permission_classes([IsAuthenticated])
def search_meals(request):
    query = request.GET.get("q")
    category = request.GET.get("category")
    area = request.GET.get("area")
    ingredient = request.GET.get("ingredient")

    meals = []

    # 🔹 1. Start with base fetch
    if query:
        res = requests.get(f"{BASE_URL}/search.php?s={query}")
        meals = res.json().get("meals") or []
    elif ingredient:
        res = requests.get(f"{BASE_URL}/filter.php?i={ingredient}")
        meals = res.json().get("meals") or []
    elif category:
        res = requests.get(f"{BASE_URL}/filter.php?c={category}")
        meals = res.json().get("meals") or []
    elif area:
        res = requests.get(f"{BASE_URL}/filter.php?a={area}")
        meals = res.json().get("meals") or []
    else:
        # fallback (random or default)
        res = requests.get(f"{BASE_URL}/search.php?s=")
        meals = res.json().get("meals") or []

    # 🔥 2. Apply additional filters manually

    def matches(meal):
        if category and meal.get("strCategory") != category:
            return False
        if area and meal.get("strArea") != area:
            return False
        if query and query.lower() not in meal.get("strMeal", "").lower():
            return False
        return True

    filtered_meals = [meal for meal in meals if matches(meal)]

    # 🔥 3. Normalize response (important for frontend)
    formatted = [
        {
            "id": meal["idMeal"],
            "title": meal["strMeal"],
            "image": meal["strMealThumb"],
        }
        for meal in filtered_meals
    ]

    return Response(formatted[:25])