from django.db import models
from categorias.models import Categoria



class Productos(models.Model):  # Nombre de clase en mayúscula por convención
    categoria = models.ForeignKey(Categoria, on_delete=models.DO_NOTHING, null=True)
    nombre = models.CharField(max_length=100,verbose_name='nombre de producto')
    stock = models.IntegerField(default=0)
    precio = models.CharField(max_length=100)
    estado=models.CharField(max_length=20,choices=[("Activo","Activo"),("Inactivo","Inactivo")],null=False)
    foto=models.ImageField(upload_to='uploads/productos/',null=True,blank=False)

    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table='producto'
        
        verbose_name= 'producto'
        
        verbose_name_plural='productos'