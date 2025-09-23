from django.urls import path
from .views import * 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns=[
    path('productos',classproductos1.as_view()),
    path('contar_productos',classContar.as_view()),
    path('productos/frutas',classFrutas.as_view()),
    path('productos/frutasP',classFrutasP.as_view()),
    path('productos/verduras',classVerdura.as_view()),
    path('productos/verdurasP',classVerduraP.as_view()),
    path('productos/leguminosas',classLeguminosa.as_view()),
    path('productos/leguminosasP',classLeguminosaP.as_view()),
    path('productos/<int:id>',classproductos2.as_view())
    
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)