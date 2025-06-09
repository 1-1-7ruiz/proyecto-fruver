from .views import *
from django.urls import path
urlpatterns = [
    path('users',classUser.as_view()),
    path('users/<int:documento>',classdeletePut.as_view())
]
