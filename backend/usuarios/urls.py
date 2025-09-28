from .views import *
from django.urls import path
urlpatterns = [
    path('users',classUsers.as_view()),
    path('register',classRegister.as_view()),
    path('users/<str:documento>',classdeletePut.as_view()),
    path('contar_activos',classContar.as_view()),
    path('perfil',PerfilUsuario.as_view()),
    
]
