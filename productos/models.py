from django.db import models

class productos(models.Model):
    nombre=models.CharField(max_length=100,null=False)
    stock=models.CharField(max_length=100,null=False)
    precio=models.CharField(max_length=100,null=False)