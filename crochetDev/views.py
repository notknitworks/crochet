from django.http import HttpResponse
from django import forms
from django.contrib.auth.views import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.models import User
from django.contrib import auth
from django.contrib import messages
from patterns.models import Patterns
from django.contrib.sessions.models import Session
from django.utils import simplejson
import json

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
		user = auth.authenticate(username=userName, password=password)
		#request.session['username'] = userName
		#return HttpResponseRedirect("Hello")
		return render_to_response("userpage.html", {}, RequestContext(request))
	return render_to_response("userpage.html", {}, RequestContext(request))

def changepw(request):
	user = request.user
	if request.method == 'POST':
		currentpwd = request.POST['current']
		if user.check_password(request.POST['current']):
			check1 = request.POST['new1']
			check2 = request.POST['new2']
			if check1 == check2:
				user.set_password(check1)
				user.save()
				#user.message_set.create(message="Password was set!")
				messages.add_message(request, messages.INFO, 'Password was set!')
			else:
				#user.message_set.create(message="Passwords did not match!")
				messages.add_message(request, messages.INFO, 'Passwords did not match!')
		else:
			#user.message_set.create(message="Current password was incorrect!")
			messages.add_message(request, messages.INFO, 'Current password was incorrect!')
	return render_to_response("userpage.html", {}, RequestContext(request))

def user(request):
	return render_to_response("userpage.html", {}, RequestContext(request))

def hello(request):
	return HttpResponse("Hello")

def loginuser(request):
	if request.method == 'POST':
		username = request.POST['username']
		password = request.POST['password']
		user = authenticate(username=username, password=password)
		if user is not None:
			if user.is_active:
				login(request)
				patterns = Patterns.objects.filter(user=username)
				request.session['patterns'] = Patterns.objects.filter(user=username)
				return render_to_response("userpage.html", {}, RequestContext(request))
			else:
				return render_to_response("homepage.html", {}, RequestContext(request))
		else:
			return render_to_response("userpage.html", {}, RequestContext(request))
	# elif request.method == 'GET':
	# 	username = request.user.username
	# 	patternName = request.GET['pattern']
	# 	pattern = Patterns.objects.filter(user=username, pattern=patternName)[0].pattern
	# 	pattern = simplejson.dumps(pattern)
	# 	return HttpResponse(pattern, content_type="application/json")

	else:
		user = request.user
		request.session['patterns'] = Patterns.objects.filter(user=user.username)
		return render_to_response("userpage.html", {}, RequestContext(request))

def savepattern(request):
	username = request.user.username
	patternName = request.GET['name']
	pattern = Patterns(user=username, name=patternName, pattern='some pattern')
	pattern.save()
	request.session['patterns'] = Patterns.objects.filter(user=username)
	return render_to_response("userpage.html", {}, RequestContext(request))
