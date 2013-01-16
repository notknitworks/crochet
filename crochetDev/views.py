from django.http import HttpResponse
from django.template import Context

def homePage(request):
	return HttpResponse("Welcome to crochet!")