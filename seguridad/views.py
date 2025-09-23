from django.shortcuts import render
from django.http.response import JsonResponse
from .models import *
from usuarios.models import Users
from django.http import Http404
from http import HTTPStatus
from rest_framework.views import APIView
from django.contrib.auth.models import User
from usuarios.models import *
import uuid
import os
from django.core.mail import send_mail
from .decorators import logueado
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from jose import jwt
from django.conf import settings
from datetime import datetime,timedelta
from django.utils import timezone

import time


from rest_framework_simplejwt.tokens import RefreshToken
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
            message=f'Bienvenido a FruverStyle, recuerda que tu nombre de usuario es tu correo: {request.data["correo"]} y tu contraseña es: {request.data["password"]}. Para verificar tu cuenta, haz clic en el siguiente enlace: {url}',
            from_email=os.getenv("EMAIL_HOST_USER"),
            recipient_list=[request.data["correo"]],
            fail_silently=False,
)
            return JsonResponse({"estado":"ok","mensaje":"registro exitoso"},status=HTTPStatus.CREATED)
        except Exception as e:
            return JsonResponse({"estado":"error","mensaje":"ocurrio un error inesperado"},status=HTTPStatus.BAD_REQUEST)
        


class classLogin(APIView):
    def post(self, request):
        correo = request.data.get("correo")
        password = request.data.get("password")

        if not correo:
            return JsonResponse({"Estado": "Error", "Mensaje": "El campo correo es obligatorio"}, status=HTTPStatus.BAD_REQUEST)

        if not password:
            return JsonResponse({"Estado": "Error", "Mensaje": "El campo password es obligatorio"}, status=HTTPStatus.BAD_REQUEST)

        try:
            user = User.objects.get(email=correo)
        except User.DoesNotExist:
            return JsonResponse({"Estado": "Error", "Mensaje": "Recurso no disponible"}, status=HTTPStatus.BAD_REQUEST)

        auth = authenticate(request, username=correo, password=password)
        if not auth:
            return JsonResponse({"Estado": "Error", "Mensaje": "Las credenciales no son correctas"}, status=HTTPStatus.BAD_REQUEST)

        try:
            #Generar tokens con la configuración de SIMPLE_JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)   
            refresh_token = str(refresh)              

            user_info = Users.objects.get(email=user.email)

            return JsonResponse({
                "id": user.id,
                "nombre": user.first_name,
                "token": access_token,         # token de acceso (12h)
                "refresh": refresh_token,      
                "is_superuser": user.is_superuser,
                "documento": user_info.documento,
                "Estado": "OK"
            })
        except Exception as e:
            return JsonResponse({"Estado": "Error", "Mensaje": str(e)}, status=HTTPStatus.BAD_REQUEST)

                
                
class ActivarCuenta(APIView):
    def post(self, request):
        token = request.data.get("token")
        if not token:
            return JsonResponse({"estado": "error", "mensaje": "Token requerido"}, status=400)

        # Buscar el token en UserMetadataU
        meta = UserMetadataU.objects.filter(token=token).first()
        if not meta:
            return JsonResponse({"estado": "error", "mensaje": "Token inválido o expirado"}, status=400)

        try:
            # Activar usuario
            
            usuario_auth = User.objects.get(id=meta.user_id)
            # Buscar el usuario en Users por email
            usuario_django = Users.objects.get(email=usuario_auth.email)
            usuario_django.estado="Activo"
            usuario_auth.is_active = True
            usuario_auth.save()
            usuario_django.save()

            #borrar el token para que no se reutilice
            meta.delete()

            return JsonResponse({"estado": "ok", "mensaje": "Cuenta activada con éxito"})
        except Exception as e:
            return JsonResponse({"estado": "error", "mensaje": str(e)}, status=500)



class classRecuperar(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return JsonResponse({"Estado": "Error", "Mensaje": "Correo incorrecto"}, status=HTTPStatus.BAD_REQUEST)

        try:
            usuario = User.objects.get(email=email)

            token = str(uuid.uuid4())
            url = f"http://127.0.0.1:5501/YoungStyle/sesion/recuperar.html?token={token}"
            print("🔗 Enlace de recuperación:", url)

            # Guardar token y fecha de expiración (1 hora desde ahora)
            UserMetadataU.objects.create(
                token=token,
                user_id=usuario.id,
                expiracion=timezone.now() + timedelta(hours=1)
            )

            send_mail(
                subject='Recuperar contraseña',
                message=f'Solicitaste un cambio de contraseña. Haz clic aquí: {url}',
                from_email=os.getenv("EMAIL_HOST_USER"),
                recipient_list=[email],
                fail_silently=False,
            )

            return JsonResponse({
                "Estado": "OK",
                "Mensaje": "Se envió el enlace de recuperación al correo"
            }, status=HTTPStatus.OK)

        except User.DoesNotExist:
            return JsonResponse({
                "Estado": "Error",
                "Mensaje": "El correo no existe"
            }, status=HTTPStatus.BAD_REQUEST)


class classRecuperarPassword(APIView):
    def post(self,request):
        if not request.data.get("nueva"):
            return JsonResponse({"Estado":"Error","Mensaje":"El campo nueva contraseña es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        if not request.data.get("confirmar"):
            return JsonResponse({"Estado":"Error","Mensaje":"El campo confirmar contraseña es obligatorio"},status=HTTPStatus.BAD_REQUEST)
        
        if request.data["nueva"] != request.data["confirmar"]:
            return JsonResponse({"Estado":"Error","Mensaje":"Las contraseñas no coinciden"},status=HTTPStatus.BAD_REQUEST)
        
        try:
            token = request.data.get("token")
            nueva = request.data.get("nueva")

            # Validar token
            meta = UserMetadataU.objects.filter(token=token).first()
            if not meta:
                return JsonResponse({"error": "Token inválido"}, status=400)

            # Verificar si ya expiró
            if meta.expiracion < timezone.now():
                return JsonResponse({"error": "El enlace de recuperación ya expiró"}, status=400)

            # Cambiar contraseña
            usuario_auth = User.objects.get(id=meta.user_id)
            usuario_auth.set_password(nueva)
            usuario_auth.save()
            
            usuario = Users.objects.get(email=usuario_auth.email)
            usuario.contraseña = nueva
            usuario.save()

            # Eliminar token para que no se pueda usar otra vez
            meta.delete()

            return JsonResponse({"mensaje": "Contraseña cambiada con éxito"})
        except User.DoesNotExist:
            return JsonResponse({"Estado":"Error","Mensaje":"El correo no existe"},status=HTTPStatus.BAD_GATEWAY)



class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return 
    
class ChangePasswordView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not old_password:
            return JsonResponse({"Estado": "Error", "Mensaje": "El campo contraseña actual es obligatorio"}, status=HTTPStatus.BAD_REQUEST)

        if not new_password:
            return JsonResponse({"Estado": "Error", "Mensaje": "El campo nueva contraseña es obligatorio"}, status=HTTPStatus.BAD_REQUEST)

        if new_password != confirm_password:
            return JsonResponse({"Estado": "Error", "Mensaje": "Las contraseñas no coinciden"}, status=HTTPStatus.BAD_REQUEST)

        user = request.user

        if not user.check_password(old_password):
            return JsonResponse({"Estado": "Error", "Mensaje": "La contraseña actual no es correcta"}, status=HTTPStatus.BAD_REQUEST)

        # Actualizar contraseña
        user.set_password(new_password)
        user.save()

        return JsonResponse({"Estado": "OK", "Mensaje": "Contraseña actualizada con éxito"}, status=HTTPStatus.OK)

