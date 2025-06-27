from rest_framework import serializers
from .models import Carrito, itemcarrito
from productos.models import Productos

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Productos
        fields = ['id', 'nombre', 'precio']  # ajusta campos según tu modelo

class ItemCarritoSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer()

    class Meta:
        model = itemcarrito
        fields = ['producto', 'cantidad']

class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True)

    class Meta:
        model = Carrito
        fields = ['id', 'usuario', 'session_key', 'creado', 'items']