from django.db import models
from autoslug import AutoSlugField
from usuarios.models import User
from productos.models import productos

# Create your models here.

class Venta(models.Model):
    documento=models.ForeignKey(User,models.DO_NOTHING)
    fecha_venta=models.DateField(auto_now=True)
    metodo_pago=models.CharField(max_length=50,null=False)
    
    
class Detalle_v(models.Model):
    venta=models.ForeignKey(Venta,models.DO_NOTHING)
    producto=models.ForeignKey(productos,models.DO_NOTHING)
    cantidad=models.IntegerField(null=False)
    precio_u=models.DecimalField(max_digits=10,decimal_places=2)
    sub_total=models.DecimalField(max_digits=10,decimal_places=2)
    total=models.DecimalField(max_digits=10,decimal_places=2)
    