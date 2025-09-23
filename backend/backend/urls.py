
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/',include('usuarios.urls')),
    path('ventas/',include('ventas.urls')),
    path('categorias/',include('categorias.urls')),
    path('productos/',include('productos.urls')),
    path('contactos/',include('contacto.urls')),
    path('seguridad/',include('seguridad.urls')),
    path('seguridad/',include('ventaProtegida.urls')),
    path('carrito/',include('carrito.urls')),
    
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
