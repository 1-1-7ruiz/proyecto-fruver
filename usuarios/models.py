from django.db import models
from autoslug import AutoSlugField
# Create your models here.



class Gestion(models.Model):
    rol=models.CharField(max_length=20,primary_key=True)
    permisos=models.CharField(max_length=50,null=False)
    slug= AutoSlugField(populate_from='rol')
    
class User(models.Model):
    documento=models.CharField(max_length=50,primary_key=True)
    nombre_completo=models.CharField(max_length=50,null=False)
    fecha_nacimiento=models.CharField(max_length=50,null=False)
    telefono=models.CharField(max_length=50,null=False)
    email=models.EmailField(max_length=100,null=False)
    direccion=models.CharField(max_length=100,null=False)
    id_rol=models.ForeignKey(Gestion,on_delete=models.DO_NOTHING)
    slug= AutoSlugField(populate_from='nombre_completo')
