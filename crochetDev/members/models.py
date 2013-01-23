from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# Create your models here.
class Pattern(models.Model):
    user = models.ForeignKey(User, related_name="created_patterns")  # pattern.user or user.created_patterns
    name = models.CharField(max_length=30)
    instructions = models.CharField(max_length=300)
    likes = models.PositiveSmallIntegerField(default=0)
    date_created = models.DateTimeField()
    date_published = models.DateTimeField(null=True)
    savers = models.ManyToManyField(User, related_name="saved_patterns") #pattern.savers or user.saved_patterns

    def save(self, *args, **kwargs):
        if self.date_created == None:
            self.date_created = datetime.now()
        super(Pattern,self).save(*args, **kwargs)

    def __unicode__(self):
    	return self.name + " by " + self.user.username

class Tag(models.Model):
	pattern = models.ForeignKey(Pattern) #tag.pattern or pattern.tag_set
	content = models.CharField(max_length=10)

	def __unicode__(self):
		return self.pattern.name + " is " + self.content

class Connection(models.Model):
	followed = models.ForeignKey(User, related_name="followers") #connection.followed or user.followers
	follower = models.ForeignKey(User, related_name="following") #connection.follower or user.following

	def __unicode__(self):
		return self.follower.username + " is now following " + self.followed.username

class Message(models.Model):
    pattern = models.ForeignKey(Pattern, null=True) #message.pattern or pattern.message_set
    sender = models.ForeignKey(User, related_name="sent") #messagesender or u1.sent
    receiver = models.ForeignKey(User, related_name="received") #message.receiver or u1.received
    content = models.CharField(max_length=100)
    date_sent = models.DateTimeField()

    def save(self, *args, **kwargs):
        if self.date_sent == None:
            self.date_sent = datetime.now()
        super(Message,self).save(*args, **kwargs)

    def __unicode__(self):
    	if self.pattern == None:
    		return self.sender.username + " sent a message to " + self.receiver.username
    	return self.sender.username + " commented on " + self.pattern.name

class Stitch(models.Model):
    user = models.ForeignKey(User) #stitch.user or user.stitch_set
    name = models.CharField(max_length=25)
    name_short = models.CharField(max_length=5)
    instructions = models.CharField(max_length=100)
    height = models.PositiveSmallIntegerField()
    width = models.PositiveSmallIntegerField()

    def __unicode__(self):
    	return self.user.username + " created_patternsd a stitch called " + self.name