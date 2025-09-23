from django.db import models

class Categoria(models.Model):
    nom_categoria=models.CharField(max_length=100,null=False)
    
    def __str__(self):
        return self.nom_categoria
    
    class Meta:
        db_table='categoria'
        
        verbose_name= 'categoria'
        
        verbose_name_plural='categorias'