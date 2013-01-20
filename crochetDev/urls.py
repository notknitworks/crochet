from django.conf.urls import patterns, include, url
from django.contrib.auth.views import login, logout
from crochetDev.views import homePage, hello, createUser, user, loginuser, changepw, savepattern

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'crochetDev.views.home', name='home'),
    (r'^$', homePage),
    (r'^hello/$', hello),
    (r'^create/$', createUser),
    #(r'^accounts/profile/$',  login, {'template_name': 'userpage.html'}),
    #(r'^accounts/login/$',  login, {'template_name': 'userpage.html'}),
    (r'^accounts/login/$',  loginuser),
    (r'^accounts/logout/$', logout, {'template_name': 'homepage.html'}),
    (r'^userpage/$', user),
    (r'^changepw/$', changepw),
    (r'^savepattern/$', savepattern)
    # url(r'^crochetDev/', include('crochetDev.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
