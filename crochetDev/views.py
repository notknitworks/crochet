from django.http import HttpResponse
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.models import User

def homePage(request):
	if request.method == 'POST':
		#form = UserCreationForm(request.POST)
		useName = request.POST['username']
		passWord = request.POST['password']
		user = User.objects.create_user(username=useName,password=passWord)
		user.save()
		return HttpResponseRedirect("/")
	return render_to_response("homepage.html", {}, context_instance=RequestContext(request))

def hello(request):
	return HttpResponse("Hello")