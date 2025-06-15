from rest_framework import serializers
from .models import *

class VentaSerializer(serializers.ModelSerializer):
    
    class Meta:
        
        model= Venta
        
        fields= '__all__'

class DetalleSerializer(serializers.ModelSerializer):
    
    class Meta:
        model= Detalle_v
        
        fields='__all__'
