
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/',include('usuarios.urls')),
    path('ventas/',include('ventas.urls')),
    path('categorias/',include('categorias.urls')),
    path('productos/',include('productos.urls'))
]
