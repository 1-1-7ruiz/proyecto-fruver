from rest_framework import serializers
from .models import *

class categoriaserializer(serializers.ModelSerializer):
    class Meta:
        model=Productos
        fields= '_all_'