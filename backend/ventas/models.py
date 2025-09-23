from django.db import models
from autoslug import AutoSlugField
from usuarios.models import Users
from productos.models import *

# Create your models here.

class Venta(models.Model):
    documento=models.ForeignKey(Users,models.DO_NOTHING)
    fecha_venta=models.DateField(auto_now_add=True)
    metodo_pago=models.CharField(max_length=50,null=False)
    total=models.DecimalField(max_digits=10,decimal_places=2,default=0)
    
    
    class Meta:
        
        db_table='venta'
        
        verbose_name='venta'
        
        verbose_name_plural= 'ventas'
    
    
class Detalle_v(models.Model):
    venta=models.ForeignKey(Venta,models.DO_NOTHING)
    producto=models.ForeignKey(Productos,models.DO_NOTHING)
    cantidad=models.DecimalField(max_digits=10,decimal_places=2,null=False)
    precio_u=models.DecimalField(max_digits=10,decimal_places=2)
    sub_total=models.DecimalField(max_digits=10,decimal_places=2,editable=False)
    
    def save(self,*args, **kwargs):
        #calculando el subtotal de cada detalle
        self.sub_total= self.precio_u * self.cantidad
        
        super().save(*args, **kwargs)
        #actualizar el total en la venta relacionada
        
        detalles=Detalle_v.objects.filter(venta=self.venta)
        total_venta=0
        
        for d in detalles:
            total_venta += d.sub_total
            
        self.venta.total=total_venta
        self.venta.save()
        
    class Meta:
        
        db_table='detalle_venta'
        
        verbose_name='detalle_ventas'
        
        verbose_name_plural= 'detalle_ventas'