from django.db import models
from autoslug import AutoSlugField
from usuarios.models import User

# Create your models here.

class Venta(models.Model):
    documento=models.ForeignKey(User,models.DO_NOTHING)
    fecha_venta=models.DateField(max_length=15,null=False)
    metodo_pago=models.CharField(max_length=50,null=False)
    