from django.shortcuts import render
from django.http.response import JsonResponse
from .models import *
from django.http import Http404
from http import HTTPStatus
from rest_framework.views import APIView
from django.contrib.auth.models import User
import uuid
import os
# Create your views here.


class class1(APIView):
    def post(self,request):
        if request.data.get("nombre")== None or not request.data.get("nombre"):
            return JsonResponse({"estado":"error","mensaje":"el campo nombre es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        if request.data.get("email")== None or not request.data.get("email"):
            return JsonResponse({"estado":"error","mensaje":"el campo E-mail es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        if request.data.get("password")== None or not request.data.get("password"):
            return JsonResponse({"estado":"error","mensaje":"el campo password es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        #validacion para correo
        
        if User.objects.filter(email=request.data["email"]).exists():
            return JsonResponse({"estado":"error","mensaje":f"el correo {request.data["email"]} no esta disponible"},
                                status=HTTPStatus.BAD_REQUEST)
            
        token=str(uuid.uuid4())
        url=f"{os.getenv("BASE_URL")}seguridad/verificacion/{token}"
        print(url)
        
        try:
            U=User.objects.create_user(username=request.data["correo"],
                                        password=request.data["password"],
                                        email=request.data["email"],
                                        first_name=request.data["nombre"],
                                        last_name=request.data[""],
                                        is_active=0)
            UserMetadataU.objects.create(token=token,user_id=U.id)
            return JsonResponse({"estado":"ok","mensaje":"registro exitoso"},status=HTTPStatus.CREATED)
        except Exception as e:
            return JsonResponse({"estado":"error","mensaje":"ocurrio un error inesperado"},status=HTTPStatus.BAD_REQUEST)
        

