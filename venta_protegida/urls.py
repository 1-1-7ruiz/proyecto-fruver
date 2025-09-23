from django.urls import path
from .views import * 

urlpatterns=[
    path('ventas-panel/<int:id>',class4.as_view()),
    #path('categoria/<int:id>',classcategoria2.as_view())
    
]