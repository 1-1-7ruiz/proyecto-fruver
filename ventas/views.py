from django.shortcuts import render
from rest_framework.views import APIView,Response
from .serializers import *
from .models import *
from http import HTTPStatus
from django.http.response import JsonResponse


# Create your views here.

class classVenta(APIView):
    def get(self,request):
        
        data= Venta.objects.all()
        
        datos_jason=VentaSerializer(data,many=True)
        
        return Response(datos_jason.data,status=HTTPStatus.OK)
    
        