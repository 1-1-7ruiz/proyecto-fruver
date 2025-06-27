from rest_framework import serializers
from .models import Productos

class Productoserializer(serializers.ModelSerializer):
    class Meta:
        
        model=Productos
        
        fields= '__all__'