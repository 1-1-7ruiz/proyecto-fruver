from django.urls import path
from .views import * 

urlpatterns=[
    path('productos',classproductos1.as_view()),
    path('productos/<int:id>',classproductos2.as_view())
    
]