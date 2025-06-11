from rest_framework import serializers
from .models import *

class categoriaserializer(serializers.ModelSerializer):
    class meta:
        model=categoria
        fields= '_all_'