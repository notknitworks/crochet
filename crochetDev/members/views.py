# Create your views here.
from django.http import HttpResponse
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.models import User
from django.contrib import auth
from django.contrib import messages
from django.contrib.sessions.models import Session
from django.utils import simplejson
import json
from django.shortcuts import redirect
from datetime import datetime
from datetime import timedelta
from models import *

def showgallery(request, name):
	user = request.user
	viewuser = User.objects.filter(username=name)[0] #there should only be one user per username
	if user is None:
		return HttpResponse("You are not logged in!")

	#patterns created and published by viewuser
	patterns = Pattern.objects.filter(user=viewuser).exclude(date_published=None)
	
	#2D array where each index corresponds to an array of tags for that particular pattern
	request.session['pattern_tags'] = [pattern.tag_set.all() for pattern in patterns]
	
	request.session['pattern_names'] = patterns.values_list('name', flat=True)
	request.session['pattern_likes'] = patterns.values_list('likes', flat=True)
	values = {'viewing':viewuser}

	#viewing own gallery
	if user == viewuser:
		#you can see your unpublished patterns
		unpublished = Pattern.objects.filter(user=viewuser,date_published__isnull=True)
		#you can see all messages pertaining to you
		messages = request.user.received.order_by('date_sent')
		messages = (viewuser.received.all() | viewuser.sent.all()).order_by('-date_sent')
		values['messages'] = messages
		values['unpublished'] = unpublished
	else:
		#you can see all messages pertaining to you and the viewer
		messages = (viewuser.received.all().filter(sender=user) | viewuser.sent.all().filter(receiver=user))
		messages = messages.order_by('-date_sent')
		values['messages'] = messages

	return render_to_response("gallery.html", values, RequestContext(request))

def shownewsfeed(request):

	#query for users being followed
	connections = request.user.following.all()	# list of connections for which user is the follower
	following = [connection.followed for connection in connections] # list of the users that this user is following
	Pattern.objects.filter(user__in=following, date_published__isnull=False).order_by('date_published')

	#query for most likes in for patterns published in last 1 [hour, day, month, year]
	now = datetime.now()
	hour = timedelta(hours=1)
	day = timedelta(days=1)
	#month = timedelta(months=1)
	#year = timedelta(year=1)

	Pattern.objects.filter(date_created__range=[now-hour, now]).order_by('likes')
	Pattern.objects.filter(date_created__range=[now-day, now]).order_by('likes')
	#Pattern.objects.filter(date_created__range=[now-month, now]).order_by('likes')
	#Pattern.objects.filter(date_created__range=[now-year, now]).order_by('likes')

	#TODO some sort of logic for which set of patterns is desired
	#TODO set appropriate session variables
	#TODO return http response

	return render_to_response("newsfeed.html", {}, RequestContext(request))

def showinterface(request, name, patternname):

	creator = User.objects.filter(username=name)

	if creator != request.user:
		pattern = Pattern.objects.filter(user=creator, name=patternname, date_published__isnull=False)
		if len(pattern) == 0:
			return HttpResponse("wrong")
			# return some sort of error
		pattern = pattern[0]
	else:
		pattern = request.user.created_patterns.filter(name=pattern)
		if len(pattern) == 0:
			return HttpResponse("wrong")
			# return some sort of error
		pattern = pattern[0]
		messages = pattern.message_set.order_by('date_sent')

	request.session['instructions'] = pattern.instructions
	request.session['likes'] = pattern.likes
	request.session['savers'] = [saver.username for saver in pattern.savers.all()]
	request.session['tags'] = pattern.tag_set.all()

	#TODO return http response

	return HttpResponse("dummy")









