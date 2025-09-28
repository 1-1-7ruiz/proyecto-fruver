from django.urls import path
from .views import * 

urlpatterns=[
    path('categoria',classcategoria.as_view()),
    path('categoria/<int:id>',classcategoria2.as_view())
    
]