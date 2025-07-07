from django.db import models
from django.contrib.auth.models import User
from productos.models import    Productos

class   Carrito(models.Model):
    usuario=models.ForeignKey(User,on_delete=models.CASCADE,null=True,blank=True)
    session_key=models.CharField(max_length=40,null=True,blank=True)
    crear=models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f'Carrito({self.usuario or self.session_key})'

class itemcarrito(models.Model):
    carrito=models.ForeignKey(Carrito,on_delete=models.CASCADE,related_name='items')
    producto=models.ForeignKey(Productos,on_delete=models.CASCADE)
    cantidad=models.PositiveIntegerField(default=1)

    def _str_(self):
        return f'{self.cantidad} x {self.producto.nombre}'
# Create your models here.