from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Like
from django.core.paginator import Paginator
import requests


BASE_URL = "https://www.themealdb.com/api/json/v1/1"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_like(request):
    user = request.user
    meal_id = request.data.get("meal_id")

    if not meal_id:
        return Response({"error": "meal_id required"}, status=400)

    like, created = Like.objects.get_or_create(
        user=user, meal_id=meal_id
    )

    if not created:
        like.delete()
        return Response({"liked": False})

    return Response({"liked": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def liked_meals(request):
    user = request.user
    page_number = request.GET.get("page", 1)

    likes = Like.objects.filter(user=user).order_by("-created_at")

    paginator = Paginator(likes, 20) 
    page = paginator.get_page(page_number)

    meals_data = []

    for like in page:
        res = requests.get(f"{BASE_URL}/lookup.php?i={like.meal_id}")
        meal = res.json().get("meals")

        if meal:
            m = meal[0]
            meals_data.append({
                "id": m["idMeal"],
                "title": m["strMeal"],
                "image": m["strMealThumb"],
            })

    return Response({
        "results": meals_data,
        "page": page.number,
        "total_pages": paginator.num_pages,
        "has_next": page.has_next(),
    })