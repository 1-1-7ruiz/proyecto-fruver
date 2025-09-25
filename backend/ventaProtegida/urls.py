from .views import *
from django.urls import path
urlpatterns = [
    path('ventas/<int:documento>',classProtegida.as_view()),
    path('ventas/home',ventas3.as_view())
]
