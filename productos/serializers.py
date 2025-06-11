from rest_framework import serializers
from .models import *

class categoriaserializer(serializers.ModelSerializer):
    class Meta:
        model=productos
        fields= '_all_'