from django.db import models
from categorias.models import categoria

class productos(models.Model):
    categoria=models.ForeignKey(categoria,models.DO_NOTHING)
    nombre=models.CharField(max_length=100,null=False)
    stock=models.CharField(max_length=100,null=False)
    precio=models.CharField(max_length=100,null=False)