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
from django.shortcuts import redirect
from members.views import shownewsfeed

from django.views.decorators.cache import cache_control

def homePage(request):
	#if request.user.is_authenticated:
	#return shownewsfeed(request)
	return render_to_response("homepage.html", {}, RequestContext(request))

def createUser(request):
	if request.method == 'POST':
		username = request.POST['username']
		password = request.POST['password']
		first_name = request.POST['first_name']
		last_name = request.POST['last_name']
		email = request.POST['email']
		user = User.objects.create_user(username=username,password=password)
		user.first_name = first_name
		user.last_name = last_name
		user.email = email
		user.save()
		return loginuser(request)
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

def viewuser(request, name):
	user = request.user
	if user is not None:
		if user.username == name:
			request.session['users'] = User.objects.all().exclude(username=user.username).order_by('?')[:10]
			request.session['viewpatterns'] = Patterns.objects.filter(user=user.username)
			return render_to_response("userpage.html", {'account':user}, RequestContext(request))
		viewuser = User.objects.filter(username=name)
		if(len(viewuser) == 1):
			request.session['users'] = User.objects.all().exclude(username=user.username).exclude(username=viewuser[0].username).order_by('?')[:10]
			request.session['viewpatterns'] = Patterns.objects.filter(user=viewuser[0].username)
			return render_to_response("userpage.html", {'account':viewuser[0]}, RequestContext(request))
		return HttpResponse("We cannot find the person you are looking for!")
	return HttpResponse("something went wrong")

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
				#request.session['patterns'] = Patterns.objects.filter(user=username)
				request.session['inbox_unread'] = user.received.filter(read=False).count()
				
				return HttpResponseRedirect("/"+ username)
			else:
				#user's account has been deactivated
				return render_to_response("newsfeed.html", {}, RequestContext(request))
		else:
			return render_to_response("newsfeed.html", {}, RequestContext(request))
	else:
		user = request.user
		request.session['patterns'] = Patterns.objects.filter(user=user.username)
		request.session['users'] = User.objects.all().exclude(username=user.username)
				
		return HttpResponseRedirect("/"+ username)
