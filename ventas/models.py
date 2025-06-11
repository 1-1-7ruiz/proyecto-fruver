from django.db import models
from autoslug import AutoSlugField
from usuarios.models import User

# Create your models here.

class Venta(models.Model):
    documento=models.ForeignKey(User,models.DO_NOTHING)
    fecha_venta=models.DateField(auto_now=True)
    metodo_pago=models.CharField(max_length=50,null=False)
    
    
class Detalle_v(models,models.DO_NOTHING):
    venta=models.ForeignKey(Venta,models.DO_NOTHING)
    cantidad=models.IntegerField(max_length=5,null=False)
    precio_u=models.DecimalField(max_length=10,null=False)
    sub_total=models.DecimalField(max_length=10,null=False)
    total=models.BigIntegerField
    