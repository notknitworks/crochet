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
from django.db.models import Count
from django.views.decorators.cache import cache_control	

def showgallery(request, name):
	user = request.user
	viewuser = User.objects.filter(username=name)[0] #there should only be one user per username
	if user is None:
		return HttpResponse("You are not logged in!")

	values = {'viewing':viewuser}

	#patterns created and published by viewuser
	patterns = Pattern.objects.filter(user=viewuser).exclude(date_published=None)
	values['published'] = patterns
	
	values['saved'] = viewuser.saved_patterns.all()

	if user == viewuser:
		unpublished = Pattern.objects.filter(user=viewuser,date_published__isnull=True)
		values['unpublished'] = unpublished
	else:
		followers = [connection.followed for connection in user.following.all()]

		if viewuser in followers:
			values['following'] = True
		else:
			values['following'] = False


	return render_to_response("gallery.html", values, RequestContext(request))

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def shownewsfeed(request):
	if not request.user.is_authenticated:
		return render_to_response("newsfeed.html", {}, RequestContext(request))


	values = {}

	patternset = Pattern.objects.filter(date_published__isnull=False)
	needsort = 'sort' in request.GET

	if 'filter_people' in request.GET:
		people = request.GET['filter_people']
		if people=='following':
			connections = request.user.following.all()	# list of connections for which user is the follower
			following = [connection.followed for connection in connections] # list of the users that this user is following
			patternset = patternset.filter(user__in=following)

	now = datetime.now()
	if 'filter_interval' in request.GET:
		time = request.GET['filter_interval']
		delta = timedelta(hours=1)
		if time == 'hour':
			delta = timedelta(hours=1)
		elif time == 'day':
			delta = timedelta(days=1)
		patternset = patternset.filter(date_created__range=[now-delta, now])

	if 'search' in request.GET:
		words = request.GET['search']
		wordset = words.split(" ")

		tagset = Tags.objects.filter(content__iexact__in=wordset)
		countlist = tags.values_list('pattern', flat=True).annotate(count=Count('pattern')).order_by('-count')
		countlist = list(countlist)

		patternset = patternset.filter(id__in=countlist)

		if not needSort:
			patternorder = [patternset.filter(id=x)[0] for x in countlist]
			return render_to_response("newsfeed.html", {'patternset':patternorder}, RequestContext(request))


	if 'sort' in request.GET:
		sort = request.GET['sort']
		if sort == 'likes':
			patternset = patternset.order_by('-likes')
		else:
			patternset = patternset.order_by('-date_published')

	patternset = patternset.order_by('-date_published')
	

	values['patternset'] = patternset
	return render_to_response("newsfeed.html", values, RequestContext(request))

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

	return HttpResponse(patternname)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def showmessagebox(request):
	user = request.user

	if request.method == 'POST':
		touser = User.objects.filter(username=request.POST['touser'])
		content = request.POST['content']
		if len(touser) != 0:
			mail = Message(sender=user,receiver=touser[0],content=content)
			mail.save()
			return getmessagesfrom(request, touser[0].username)
		else:
			assert False

	if request.method == 'GET':
		if 'username' in request.GET:
			return getmessagesfrom(request, request.GET['username'])

	#queries to get a list of unique users this user has messaged (sent or received)
	messages = (user.received.all() | user.sent.all()).order_by('-date_sent')
	all_interactions = [message.sender if message.sender!= user else message.receiver for message in messages]
	interactions = []

	for message in all_interactions:
		if message not in interactions:
			interactions.append(message)

	request.session['user_messages'] = interactions
	return render_to_response("messagebox.html", {}, RequestContext(request))

def getmessagesfrom(request, username):
	user = request.user
	values = {}
	partner = User.objects.filter(username=username)[0]
	values['conversation'] = (user.received.filter(sender=partner) | user.sent.filter(receiver=partner)).order_by('date_sent')
	values['partner'] = partner
	return render_to_response("messagebox.html",values, RequestContext(request))

def followuser(request):
	name = request.GET['person']
	action = request.GET['action']

	followed = User.objects.filter(username=name)[0]

	if action == 'follow':
		connection = Connection(followed=followed, follower=request.user)
		connection.save()
	else:
		find = Connection.objects.filter(followed=followed, follower=request.user)
		for connection in find:
			connection.delete()

	#json.dumps is the python equivalent of json.serialize
	#(json.loads is the python equivalent of json.eval)
	#it takes in a python dictionary and converts it to a JSON object
	#converted = json.dumps(response)
	return HttpResponse(json.dumps({}), content_type="application/json")

def savepattern(request):
	name = request.GET['person']
	galleryowner = User.objects.filter(username=name)[0]

	patterns = galleryowner.created_patterns.filter(name=request.GET['pattern'])
	pattern = patterns[0]

	request.user.saved_patterns.add(pattern)
	request.user.save()

	return HttpResponse(json.dumps({}), content_type="application/json")

def removepattern(request):
	name = request.GET['person']
	creator = User.objects.filter(username=name)[0]

	patterns = creator.created_patterns.filter(name=request.GET['pattern'])
	pattern = patterns[0]

	request.user.saved_patterns.remove(pattern)
	request.user.save()

	return HttpResponse(json.dumps({}), content_type="application/json")
	











