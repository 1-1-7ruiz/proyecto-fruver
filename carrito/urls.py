from django.urls import path
from .views import * 

urlpatterns=[
    path('carrito',Carrito1.as_view()),
    path('carrito/<int:id>',Carrito2.as_view())
    
]