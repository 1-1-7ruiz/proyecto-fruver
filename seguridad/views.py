from django.shortcuts import render
from django.http.response import JsonResponse
from .models import *
from django.http import Http404
from http import HTTPStatus
from rest_framework.views import APIView
from django.contrib.auth.models import User
import uuid
import os
from django.core.mail import send_mail
from .decorators import logueado
from django.contrib.auth import authenticate
from jose import jwt
from django.conf import settings
from datetime import datetime,timedelta
import time
# Create your views here.


class class1(APIView):
    def post(self,request):
        if request.data.get("nombre")== None or not request.data.get("nombre"):
            return JsonResponse({"estado":"error","mensaje":"el campo nombre es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        if request.data.get("correo")== None or not request.data.get("correo"):
            return JsonResponse({"estado":"error","mensaje":"el campo E-mail es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        if request.data.get("password")== None or not request.data.get("password"):
            return JsonResponse({"estado":"error","mensaje":"el campo password es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        #validacion para correo
        
        if User.objects.filter(email=request.data["correo"]).exists():
            return JsonResponse({"estado":"error","mensaje":f"el correo {request.data["correo"]} no esta disponible"},
                                status=HTTPStatus.BAD_REQUEST)
            
        token=str(uuid.uuid4())
        url=f"{os.getenv("BASE_URL")}seguridad/verificacion/{token}"
        print(url)
        
        try:
            u=User.objects.create_user(username=request.data["correo"],
                                        password=request.data["password"],
                                        email=request.data["correo"],
                                        first_name=request.data["nombre"],
                                        last_name="",
                                        is_active=0)
            UserMetadataU.objects.create(token=token,user_id=u.id)
            
            @logueado
            def prueba_token(request):
                return JsonResponse({"mensaje": "Token válido, acceso concedido"})
            
            send_mail(
            subject='Verificación de cuenta',
            message=f'Por favor verifica tu cuenta ingresando al siguiente enlace: {url}',
            from_email=os.getenv("EMAIL_HOST_USER"),
            recipient_list=[request.data["correo"]],
            fail_silently=False,
)
            return JsonResponse({"estado":"ok","mensaje":"registro exitoso"},status=HTTPStatus.CREATED)
        except Exception as e:
            return JsonResponse({"estado":"error","mensaje":"ocurrio un error inesperado"},status=HTTPStatus.BAD_REQUEST)
        

class classLogin(APIView):
    def post(self,request):
        
        if request.data.get("correo")==None or not request.data.get("correo"):
            return JsonResponse({"Estado":"Error",
                                "Mensaje":"El campo correo es obligatorio"},
                                status=HTTPStatus.BAD_REQUEST)
            
        if request.data.get("password")==None or not request.data.get("password"):
            return JsonResponse({"Estado":"Error",
                                "Mensaje":"El campo password es obligatorio"},
                                status=HTTPStatus.BAD_REQUEST)
            
        try:
            user=User.objects.filter(email=request.data["correo"]).get()
        except User.DoesNotExist:
            return JsonResponse({"Estado":"Error",
                                "Mensaje":"Recurso no disponible"},
                                status=HTTPStatus.BAD_REQUEST)

        auth=authenticate(request,username=request.data.get("correo"),password=request.data.get("password"))
        if auth is not None:
            pass
        else:
            return JsonResponse({"Estado":"Error",
                                "Mensaje":"Los campos ingresados no son correctos"},
                                status=HTTPStatus.BAD_REQUEST)
        
        try:
            user=User.objects.filter(email=request.data["correo"]).get()
            
        except User.DoesNotExist:
            return JsonResponse({"Estado":"Error",
                                "Mensaje":"Recurso no disponible"},
                                status=HTTPStatus.BAD_REQUEST)
        auth=authenticate(request,username=request.data.get("correo"),password=request.data.get("password"))
        if auth is not None:
            fecha=datetime.now()
            despues=fecha+timedelta(days=1)
            fecha_numero=int(datetime.timestamp(despues))
            payload={"id":user.id,
                    "ISS":os.getenv("BASE_URL"),
                    "iat":int(time.time()),
                    "exp":int(fecha_numero)
                    }
            try:
                token=jwt.encode(payload,settings.SECRET_KEY,algorithm="HS512")
                return JsonResponse({"id":user.id,"nombre":user.first_name,"token":token})
            except Exception as e:
                return JsonResponse({"Estado":"Error",
                                "Mensaje":"Ocurrio un error inesperado"},
                                status=HTTPStatus.BAD_REQUEST)
        else:
                return JsonResponse({"Estado":"Error",
                                "Mensaje":"las credenciales ingresadas no son correctas"},
                                status=HTTPStatus.BAD_REQUEST)
