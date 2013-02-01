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

	values = {'viewing':viewuser}

	#patterns created and published by viewuser
	patterns = Pattern.objects.filter(user=viewuser).exclude(date_published=None)
	values['published'] = patterns
	
	values['saved'] = viewuser.saved_patterns.all()

	if user == viewuser:
		unpublished = Pattern.objects.filter(user=viewuser,date_published__isnull=True)
		values['unpublished'] = unpublished
	else:
		if user.is_authenticated():
			followers = [connection.followed for connection in user.following.all()]

			if viewuser in followers:
				values['following'] = True
			else:
				values['following'] = False


	return render_to_response("gallery.html", values, RequestContext(request))

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def shownewsfeed(request):
	values = {}
	patternset = Pattern.objects.filter(date_published__isnull=False)

	if not request.user.is_authenticated:
		patternset = patternset.order_by('-date_published')
		values['patternset'] = patternset
		return render_to_response("newsfeed.html", values, RequestContext(request))

	if 'filter_people' in request.GET:
		people = request.GET['filter_people']
		if people=='following':
			connections = request.user.following.all()	# list of connections for which user is the follower
			following = [connection.followed for connection in connections] # list of the users that this user is following
			patternset = patternset.filter(user__in=following)
			values['following'] = 'checked'
		else:
			values['allpeople'] = 'checked'
	else:
		values['allpeople'] = 'checked'

	now = datetime.now()
	if 'filter_interval' in request.GET:
		time = request.GET['filter_interval']
		delta = datetime.now()
		if time == 'hour':
			delta = timedelta(hours=1)
			patternset = patternset.filter(date_created__range=[now-delta, now])
			values['hours'] = 'checked'
		elif time == 'day':
			delta = timedelta(days=1)
			patternset = patternset.filter(date_created__range=[now-delta, now])
			values['days'] = 'checked'
		else:
			values['alltime'] = 'checked'
	else:
		values['alltime'] = 'checked'
		
	#when RELEVANCY is chosen by
	if 'search' in request.GET:
		words = request.GET['search']
		if words != "":

			wordset = words.split(" ")
			values['words'] = words

			tagset = Tag.objects.filter(content__in=wordset)

			countlist = None

			if 'sort' in request.GET:
				if request.GET['sort'] == 'likes':
					values['likes'] = 'checked'
					countlist = tagset.values_list('pattern', flat=True).annotate(count=Count('pattern')).order_by('-count', '-pattern__likes')
				else:
					values['datepub'] = 'checked'
					countlist = tagset.values_list('pattern', flat=True).annotate(count=Count('pattern')).order_by('-count', '-pattern')
			else:
				values['datepub'] = 'checked'
				countlist = tagset.values_list('pattern', flat=True).annotate(count=Count('pattern')).order_by('-count', '-pattern')
			countlist = list(countlist)

			
			if len(patternset) == 0:
				return render_to_response("newsfeed.html", values, RequestContext(request))
			patternorder = [patternset.filter(id=x)[0] for x in countlist if len(patternset.filter(id=x)) == 1]
			values['patternset'] = patternorder
			return render_to_response("newsfeed.html", values, RequestContext(request))


	if 'sort' in request.GET:
		sort = request.GET['sort']
		if sort == 'likes':
			patternset = patternset.order_by('-likes')
			values['likes'] = 'checked'
		elif sort == 'published':
			patternset = patternset.order_by('-date_published')
			values['datepub'] = 'checked'
		else:
			values['relevancy'] = 'checked'
	else:
		values['datepub'] = 'checked'
		patternset = patternset.order_by('-date_published')
	

	values['patternset'] = patternset
	return render_to_response("newsfeed.html", values, RequestContext(request))

def showinterface(request, name, patternid):

	creator = User.objects.filter(username=name)[0]
	values = {}

	if creator != request.user:
		#viewing someone else's pattern
		pattern = Pattern.objects.filter(user=creator, id=patternid, date_published__isnull=False)
		if len(pattern) == 0:
			return render_to_response("interface.html", values, RequestContext(request))
			# return some sort of error
		pattern = pattern[0]
		values['pattern'] = pattern
	else:
		#user's own pattern (may be unpublished)
		pattern = request.user.created_patterns.filter(id=patternid)
		if len(pattern) == 0:
			return HttpResponse("wrong")
			# return some sort of error
		pattern = pattern[0]
		values['pattern'] = pattern

	#TODO return http response

	return render_to_response("interface.html", values, RequestContext(request))

def createnew(request, name):
	creators = User.objects.filter(username=name)
	if creators.count() == 0:
		return HttpResponse("anonymous user")
	else:
		creator = creators[0]
		num = 1
		success = False
		p = None
		while not success:
			name = "untitled" + str(num) + ""
			made = creator.created_patterns.all().filter(name=name)
			boolean = made.count() == 0
			if made.count() == 0:
				p = Pattern(user=creator, name=name, instructions="")
				p.save()
				success = True
			else:
				num += 1
		return HttpResponseRedirect("/"+ creator.username + "/" + str(p.id) + "/")

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

	unreadcount = []
	unreadvalues = []
	for sender in interactions:
		unreadcount.append(messages.filter(receiver=user, sender=sender, read=False).count())
		unreadvalues.append((sender,messages.filter(receiver=user, sender=sender, read=False).count()))

	request.session['unread_values'] = unreadvalues
	return render_to_response("messagebox.html", {}, RequestContext(request))

def getmessagesfrom(request, username):
	user = request.user
	values = {}
	partner = User.objects.filter(username=username)[0]
	receivedmessages = user.received.filter(sender=partner)
	
	for convo in receivedmessages:
		if convo.read == False:
			convo.read = True
			convo.save()

	request.session['inbox_unread'] = user.received.filter(read=False).count()

	values['conversation'] = (receivedmessages | user.sent.filter(receiver=partner)).order_by('date_sent')
	values['partner'] = partner
	return render_to_response("messagebox.html",values, RequestContext(request))

def followuser(request):
	name = request.GET['person']
	action = request.GET['action']

	followed = User.objects.filter(username=name)[0]

	if action == 'follow':
		connection = Connection(followed=followed, follower=request.user)
		connection.save()
		#messages.add_message(request, messages.INFO, 'Hello world.')
		#followed.message_set.create(message="<a href='/{{request.user.username}}'>" + request.user.username 
		#	+ "</a> started following you.")
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
	pattern.likes = pattern.likes + 1
	pattern.save()

	request.user.saved_patterns.add(pattern)

	return HttpResponse(json.dumps({}), content_type="application/json")

def saveinstructions(request):
	id = request.GET['patternid']
	patterns = Pattern.objects.filter(id=id)
	if len(patterns) == 1:
		pattern = patterns[0]
		pattern.instructions = request.GET['instructions']
		pattern.save()
	return HttpResponse(json.dumps({}), content_type="application/json")


def removepattern(request):
	name = request.GET['person']
	creator = User.objects.filter(username=name)[0]

	patterns = creator.created_patterns.filter(name=request.GET['pattern'])
	pattern = patterns[0]
	pattern.likes = pattern.likes - 1
	pattern.save()

	request.user.saved_patterns.remove(pattern)
	request.user.save()

	return HttpResponse(json.dumps({}), content_type="application/json")

def deletepattern(request):
	patternid = request.GET['patternid']
	pattern = Pattern.objects.filter(id=patternid)
	if pattern.count() == 1:
		pattern.delete()

	return HttpResponse(json.dumps({}), content_type="application/json")

def publishpattern(request):
	patternid = request.GET['patternid']
	patterns = Pattern.objects.filter(id=patternid)
	if patterns.count() == 1:
		pattern = patterns[0]
		pattern.date_published = datetime.now()
		pattern.save()
	return HttpResponse(json.dumps({}), content_type="application/json")
	











