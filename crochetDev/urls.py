from django.conf.urls import patterns, include, url
from django.contrib.auth.views import login, logout
from crochetDev.views import homePage, hello, createUser, user, loginuser, changepw, viewuser
from crochetDev.members.views import showgallery, showinterface, shownewsfeed, showmessagebox, followuser, savepattern, removepattern

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'crochetDev.views.home', name='home'),
    (r'^$', homePage),
    (r'^hello/$', hello),
    (r'^create/$', createUser),
    (r'^accounts/login/$',  loginuser),
    (r'^accounts/logout/$', logout, {'next_page': '/'}),
    (r'^userpage/$', user),
    (r'^changepw/$', changepw),
    #(r'^(?P<path>.*)$', 'django.views.static.serve',
    #    {'document_root': '/home/neha/crochetProj/crochetDev/static/'}),
    (r'^accounts/login/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': '/home/neha/crochetProj/crochetDev/static/'}),
    (r'^account/(?P<name>\w+)$', viewuser),
    (r'^savepattern/$', savepattern),
    (r'^removepattern/$', removepattern),
    (r'^follow/$', followuser),
    (r'^newsfeed/$', shownewsfeed),
    (r'^inbox/$', showmessagebox),
    (r'^(?P<name>\w+)/$', showgallery),
    (r'^(?P<name>\w+)/(?P<patternname>.+)/$', showinterface),













    # url(r'^crochetDev/', include('crochetDev.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
