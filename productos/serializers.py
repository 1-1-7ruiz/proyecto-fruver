from rest_framework import serializers
from .models import Productos

class Productoserializer(serializers.ModelSerializer):
    

    class Meta:
        model = Productos
        fields = '__all__'
    def get_foto(self, obj):
        try:
            request = self.context.get('request')
            if obj.foto and hasattr(obj.foto, 'url'):
                return request.build_absolute_uri(obj.foto.url)
        except:
            return None

    
