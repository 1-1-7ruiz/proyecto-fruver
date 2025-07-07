from django.urls import path

from .views import *

urlpatterns = [
    path('registro',class1.as_view()),
    path('login',classLogin.as_view())
]
