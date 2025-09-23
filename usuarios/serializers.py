from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        
        model= Users
        
        fields= '__all__'
        
class GestionSerializer(serializers.ModelSerializer):
    
    class Meta:
        
        model= Gestion
        
        fields= '__all__'
    
    