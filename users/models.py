from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    # ProfilePicture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    def __str__(self):
        return self.username