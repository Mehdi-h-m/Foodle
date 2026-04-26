from datetime import timedelta
from django.utils import timezone
from django.shortcuts import render
from django.http import JsonResponse
import requests
from .models import DisplayedMeal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.paginator import Paginator
import random
from interactions.models import Like, View
from collections import defaultdict
from django.core.cache import cache
import httpx

BASE_URL = "https://www.themealdb.com/api/json/v1/1"

@api_view(["Get"])
@permission_classes([IsAuthenticated])
def Discover(request):
        user = request.user
        meals = []
        cutoff = timezone.now() - timedelta(days=3)

        attempts = 0
        MAX_ATTEMPTS = 50 

        while len(meals) < 20 and attempts < MAX_ATTEMPTS:
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
    page_number = int(request.GET.get("page", 1))

    meals = []

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


    def matches(meal):
        if category and meal.get("strCategory") != category:
            return False
        if area and meal.get("strArea") != area:
            return False
        if query and query.lower() not in meal.get("strMeal", "").lower():
            return False
        return True

    filtered_meals = [meal for meal in meals if matches(meal)]


    formatted = [
        {
            "id": meal["idMeal"],
            "title": meal["strMeal"],
            "image": meal["strMealThumb"],
        }
        for meal in filtered_meals
    ]

    paginator = Paginator(formatted, 20)
    page = paginator.get_page(page_number)

    return Response({
        "results": list(page),
        "page": page.number,
        "total_pages": paginator.num_pages,
        "has_next": page.has_next(),
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
async def get_meal_detail(request, meal_id):
    cache_key = f"meal_detail:{meal_id}"

    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(f"{BASE_URL}/lookup.php?i={meal_id}")
        data = res.json().get("meals")

    if not data:
        return Response({"error": "Meal not found"}, status=404)

    meal = data[0]

    ingredients = []
    for i in range(1, 21):
        ing = meal.get(f"strIngredient{i}")
        measure = meal.get(f"strMeasure{i}")

        if ing and ing.strip():
            ingredients.append({
                "name": ing,
                "measure": measure
            })

    formatted = {
        "id": meal["idMeal"],
        "title": meal["strMeal"],
        "category": meal.get("strCategory"),
        "area": meal.get("strArea"),
        "instructions": meal.get("strInstructions"),
        "image": meal.get("strMealThumb"),
        "youtube": meal.get("strYoutube"),
        "ingredients": ingredients,
    }

    cache.set(cache_key, formatted, timeout=60 * 60 * 24)  # 24h

    return Response(formatted)







def get_random_meals(limit=15):
    meals = []

    for _ in range(limit):
        res = requests.get(f"{BASE_URL}/random.php")
        data = res.json().get("meals")
        if data:
            meals.append(data[0])

    return meals


def get_meal_details(meal_id):
    res = requests.get(f"{BASE_URL}/lookup.php?i={meal_id}")
    data = res.json().get("meals")
    return data[0] if data else None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fyp(request):
    user = request.user

    #  optional reproducible randomness
    seed = request.GET.get("seed")
    if seed:
        random.seed(seed)

    #  user interactions
    likes = Like.objects.filter(user=user)
    views = View.objects.filter(user=user).order_by("-viewed_at")[:30]

    # fallback
    if not likes and not views:
        res = requests.get(f"{BASE_URL}/search.php?s=")
        meals = res.json().get("meals") or []

        random.shuffle(meals)

        return Response([
            {
                "id": m["idMeal"],
                "title": m["strMeal"],
                "image": m["strMealThumb"],
                "exploration": True
            }
            for m in meals[:25]
        ])

    #  build preference profile
    category_scores = defaultdict(float)
    area_scores = defaultdict(float)
    ingredient_scores = defaultdict(float)

    # likes (strong signal)
    for like in likes:
        meal = get_meal_details(like.meal_id)
        if not meal:
            continue

        category_scores[meal["strCategory"]] += 3
        area_scores[meal["strArea"]] += 3

        for i in range(1, 21):
            ing = meal.get(f"strIngredient{i}")
            if ing:
                ingredient_scores[ing.lower()] += 3

    # views (weak + recency)
    for view in views:
        meal = get_meal_details(view.meal_id)
        if not meal:
            continue

        days_old = (now() - view.viewed_at).days
        recency_bonus = max(0, 3 - days_old)

        weight = 1 + view.view_count + recency_bonus

        category_scores[meal["strCategory"]] += weight
        area_scores[meal["strArea"]] += weight

        for i in range(1, 21):
            ing = meal.get(f"strIngredient{i}")
            if ing:
                ingredient_scores[ing.lower()] += weight

    # top preferences
    top_categories = sorted(category_scores, key=category_scores.get, reverse=True)[:2]
    top_areas = sorted(area_scores, key=area_scores.get, reverse=True)[:2]
    top_ingredients = sorted(ingredient_scores, key=ingredient_scores.get, reverse=True)[:3]

    # candidate meals
    candidates = []

    for cat in top_categories:
        res = requests.get(f"{BASE_URL}/filter.php?c={cat}")
        candidates += res.json().get("meals") or []

    for area in top_areas:
        res = requests.get(f"{BASE_URL}/filter.php?a={area}")
        candidates += res.json().get("meals") or []

    for ing in top_ingredients:
        res = requests.get(f"{BASE_URL}/filter.php?i={ing}")
        candidates += res.json().get("meals") or []

    # remove duplicates
    seen = set()
    unique_candidates = []
    for c in candidates:
        if c["idMeal"] not in seen:
            seen.add(c["idMeal"])
            unique_candidates.append(c)

    # already interacted
    liked_ids = set(l.meal_id for l in likes)
    viewed_ids = set(v.meal_id for v in views)

    unique_candidates = [
        c for c in unique_candidates
        if c["idMeal"] not in liked_ids and c["idMeal"] not in viewed_ids
    ]

    # scoring
    scored = []

    for c in unique_candidates[:30]:
        meal = get_meal_details(c["idMeal"])
        if not meal:
            continue

        score = 0

        if meal["strCategory"] in top_categories:
            score += 2
        if meal["strArea"] in top_areas:
            score += 2

        for i in range(1, 21):
            ing = meal.get(f"strIngredient{i}", "").lower()
            if ing in top_ingredients:
                score += 1

        #  randomness
        score += random.uniform(0, 1.5)

        scored.append((score, meal))

    scored.sort(key=lambda x: x[0], reverse=True)

    # top exploitation
    top = scored[:30]
    random.shuffle(top)

    personalized = [
        {
            "id": m["idMeal"],
            "title": m["strMeal"],
            "image": m["strMealThumb"],
            "exploration": False
        }
        for _, m in top[:15]
    ]

    # exploration (new content)
    exploration_pool = get_random_meals(limit=20)

    exploration = []

    for meal in exploration_pool:
        meal_id = meal["idMeal"]

        if meal_id in liked_ids or meal_id in viewed_ids:
            continue

        exploration.append({
            "id": meal_id,
            "title": meal["strMeal"],
            "image": meal["strMealThumb"],
            "exploration": True
        })

    exploration = exploration[:5]

    # merge + shuffle final feed
    final_feed = personalized + exploration
    random.shuffle(final_feed)

    return Response(final_feed)