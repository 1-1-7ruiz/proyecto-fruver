from django.db import models

class categoria(models.Model):
    nom_categoria=models.CharField(max_length=100,null=False)