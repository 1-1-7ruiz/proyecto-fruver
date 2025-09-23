from rest_framework import serializers
from .models import *

class VentaSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source='documento.nombres', read_only=True)
    
    
    #traer los datos del usuario
    user=serializers.ReadOnlyField(source='user.nombres')
    
    class Meta:
        
        model= Venta
        
        fields= ("id","fecha_venta","metodo_pago","total",
                "documento","user","nombres")

class DetalleSerializer(serializers.ModelSerializer):
    
    class Meta:
        model= Detalle_v
        
        fields='__all__'
