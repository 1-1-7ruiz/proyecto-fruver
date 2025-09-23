from django.shortcuts import render
from rest_framework.views import APIView
from django.http.response import JsonResponse
from .models import *
from http import HTTPStatus
from django.http import Http404
from datetime import datetime
from utilidades import utilidades
# Create your views here.

class class1(APIView):
    
    def post(self,request):
        
        campos_requeridos={
            "nombre":"El nombre es requerido",
            "email":"El E-mail es requerido",
            "telefono":"El telefono es requerido",
            "mensaje":"el mensaje es requerido"
        }
        
        for dato,mensaje in campos_requeridos.items():
            
            valor=request.data.get(dato)
            
            if valor is None or valor=="":
                
                return JsonResponse(
                    {"Estado":"error","mensaje":mensaje},
                    status=HTTPStatus.BAD_REQUEST)
                
        try:
            Contacto.objects.create(nombre=request.data['nombre'],
                                    email=request.data['email'],
                                    telefono=request.data['telefono'],
                                    mensaje=request.data['mensaje'],
                                    fecha=datetime.now())
            
            html=f"""
                <h1>Nuevo mensaje del sitio web</h1>
                <ul>
                    <li>Nombre: {request.data['nombre']}</li>
                    <li>E-Mail: {request.data['email']}</li>
                    <li>Telefono: {request.data['telefono']}</li>
                    <li>Mensaje: {request.data['mensaje']}</li>
                    
                </ul>
            """
            utilidades.sendMail(html,"Mensaje desde le sitio web","fruverproyecto072@gmail.com")
        
        except Exception as e:
            print("Error al enviar el correo",e)
            return JsonResponse({"estado":"error",
                                "mensaje":f"ocurrio un error inesperado:{str(e)}"
                                },status=HTTPStatus.BAD_REQUEST)
        
            
        return JsonResponse({"estado":"ok","mensaje":"Contacto creado con exito"}
                            ,status=HTTPStatus.CREATED)
        
        