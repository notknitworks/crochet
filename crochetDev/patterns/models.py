from django.db import models

# Create your models here.
class Patterns(models.Model):
	user = models.CharField(max_length=30)
	name = models.CharField(max_length=30)
	pattern = models.CharField(max_length=400)
