from rest_framework import serializers
from .models import *

class categoriaserializer(serializers.ModelSerializer):
    class meta:
        model=productos
        fields= '_all_'