from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .Serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": serializer.data,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    return Response(serializer.errors, status=400)