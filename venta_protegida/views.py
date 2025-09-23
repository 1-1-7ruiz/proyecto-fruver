from django.shortcuts import render
from rest_framework.views import APIView
from django.http.response import JsonResponse
from http import HTTPStatus
from django.http import Http404
from django.contrib.auth.models import User

from seguridad.decorators import logueado
from ventas.serializers import * #importa el serializer que creamos en la aplicacion de ventas
from ventas.models import * #importa el modelo ventas
# Create your views here.

class class4(APIView):
    
    @logueado
    def get(self,request,id):
        #validar que el usuario existe o no para utilizarlo dentro de la aplicacion

        try:
            existe=User.objects.filter(id=id).get()
        except User.DoesNotExist:
            return JsonResponse ({"Estado":"Error","Mensaje":"Ocurrio un error inesperado"})
        
        data=Venta.objects.filter(user_id=id).order_by('-id').all()
        datos_json=VentaSerializer(data, many=True)
        return JsonResponse({"data":datos_json.data},status=HTTPStatus.OK)
