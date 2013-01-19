from django.http import HttpResponse
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.models import User
from django.contrib import auth

def homePage(request):
	#if request.method == 'POST':
	#	useName = request.POST['username']
	#	passWord = request.POST['password']
	#	user = User.objects.create_user(username=useName,password=passWord)
	#	user.save()
	#	user = auth.authenticate(username=username, password=password)
		#request.session['username'] = userName
	#	return HttpResponseRedirect("Hello")
	return render_to_response("homepage.html", {}, RequestContext(request))

def createUser(request):
	if request.method == 'POST':
		useName = request.POST['username']
		passWord = request.POST['password']
		user = User.objects.create_user(username=useName,password=passWord)
		user.save()
		user = auth.authenticate(username=username, password=password)
		#request.session['username'] = userName
		#return HttpResponseRedirect("Hello")
		return render_to_response("homepage.html", {}, RequestContext(request))
	return render_to_response("homepage.html", {}, RequestContext(request))

def user(request):
	return render_to_response("userpage.html", {}, RequestContext(request))

def hello(request):
	return HttpResponse("Hello")