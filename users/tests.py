from rest_framework.test import APITestCase
from django.urls import reverse

class AuthTests(APITestCase):

    def test_register_success(self):
        data = {
            "username": "mehdi",
            "email": "mehdi@test.com",
            "password": "Password"
        }
        response = self.client.post(reverse("register"), data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["username"], "mehdi")

    def test_register_duplicate_email(self):
        self.client.post(reverse("register"), {
            "username": "mehdi",
            "email": "mehdi@test.com",
            "password": "Password"
        })

        response = self.client.post(reverse("register"), {
            "username": "mehdi",
            "email": "mehdi@test.com",
            "password": "Password"
        })

        self.assertEqual(response.status_code, 400)

    def test_login_success(self):
        self.client.post(reverse("register"), {
            "username": "mehdi",
            "email": "mehdi@test.com",
            "password": "Password"
        })

        response = self.client.post(reverse("login"), {
            "username": "mehdi",
            "password": "Password"
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

