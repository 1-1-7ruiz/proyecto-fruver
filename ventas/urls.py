from .views import *
from django.urls import path

urlpatterns = [
    path('venta',classVenta.as_view())
]
