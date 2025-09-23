from django.db import models
from autoslug import AutoSlugField
# Create your models here.



class Gestion(models.Model):
    rol=models.CharField(max_length=20,primary_key=True,choices=[("cliente","cliente"),("admin","admin")])
    permisos=models.CharField(max_length=50,null=False)
    slug= AutoSlugField(populate_from='rol')
    
class Users(models.Model):
    id_rol=models.ForeignKey(Gestion,on_delete=models.DO_NOTHING)
    documento=models.CharField(max_length=50,primary_key=True)
    nombres=models.CharField(max_length=50,null=True)
    apellidos=models.CharField(max_length=50,null=True)
    telefono=models.CharField(max_length=50,null=False)
    email=models.EmailField(max_length=100,null=False)
    direccion=models.CharField(max_length=100,null=False)
    estado=models.CharField(max_length=100,default="Inactivo", choices=[("Activo","Activo"),("Inactivo","Inactivo")],null=False)
    slug= AutoSlugField(populate_from='nombres')
    contraseña=models.CharField(max_length=100,null=False)
    
    def __str__(self):
        return self.nombres
    
    class Meta:
        db_table='usuarios'
        
        verbose_name= 'usuario'
        
        verbose_name_plural='usuarios'
    
    
