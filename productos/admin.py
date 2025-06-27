from django.contrib import admin

# Register your models here.

from productos.models import Productos

class ProductosAdmin(admin.ModelAdmin):
    list_filter=("categoria",)

admin.site.register(Productos,ProductosAdmin)