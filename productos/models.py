from django.db import models
from categorias.models import categoria



class Productos(models.Model):  # Nombre de clase en mayúscula por convención
    categoria = models.ForeignKey(categoria, on_delete=models.DO_NOTHING, null=True)
    nombre = models.CharField(max_length=100)
    stock = models.CharField(max_length=100)
    precio = models.CharField(max_length=100)
