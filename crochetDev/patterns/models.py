from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# Create your models here.
class Patterns(models.Model):
	user = models.CharField(max_length=30)
	name = models.CharField(max_length=30)
	pattern = models.CharField(max_length=400)

	def __unicode__(self):
		return self.pattern + " by " + self.user