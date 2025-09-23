from django.shortcuts import render
from rest_framework.views import APIView, Response
from django.http.response import JsonResponse
from .models import *
from .serializers import *
from http import HTTPStatus
from django.http import Http404
from django.db.models import Q
from django.contrib.auth.models import User
from django.core.mail import send_mail
from seguridad.decorators import logueado
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
import uuid
import os
from jose import jwt
from django.conf import settings
from seguridad.models import UserMetadataU
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
# Create your views here.

class classUsers(APIView):
    
    
    
    def get(self, request):
        nombre = request.GET.get('nombre', '').strip()
        estado = request.GET.get('estado', '').strip()
        rol = request.GET.get('rol', '').strip()

        usuario = Users.objects.all()

        if nombre:
            usuario = usuario.filter(
                Q(nombres__icontains=nombre) |
                Q(apellidos__icontains=nombre) |
                Q(email__icontains=nombre) |
                Q(documento__icontains=nombre)
            )

        if estado and estado != "todos":
            try:
                usuario = usuario.filter(estado__iexact=estado)
            except ValueError:
                pass

        if rol and rol != "todos":
            usuario = usuario.filter(id_rol__rol__iexact=rol)  
            

        usuario = usuario.order_by('nombres')

        usuario_serializado = UserSerializer(usuario, many=True)
        rolPermisos = Gestion.objects.all()
        rol_serializado = GestionSerializer(rolPermisos, many=True)

        return Response({
            "usuario": usuario_serializado.data,
            "rol": rol_serializado.data
        }, status=HTTPStatus.OK)


    
    def post(self, request):
        campos_usuario = {
        "documento": "El documento es obligatorio",
        "nombres": "El nombre es obligatorio",
        "apellidos": "El apellido es obligatorio",
        "telefono": "El número de teléfono es obligatorio",
        "email": "El correo electrónico es obligatorio",
        "id_rol": "El rol es obligatorio",
        "direccion": "La dirección es obligatoria",
        "estado": "El estado es obligatorio",
        "contraseña": "La contraseña es obligatoria"
    }

        for campo, mensaje in campos_usuario.items():
            if not request.data.get(campo):
                return JsonResponse(
                    {"estado": "error", "mensaje": mensaje},
                    status=HTTPStatus.BAD_REQUEST
                )

        if Users.objects.filter(documento=request.data["documento"]).exists():
            return JsonResponse(
                {"estado": "error", "mensaje": f"El documento {request.data['documento']} ya está registrado"},
                status=HTTPStatus.BAD_REQUEST
            )

        if Users.objects.filter(email=request.data["email"]).exists():
            return JsonResponse(
                {"estado": "error", "mensaje": f"El correo {request.data['email']} no está disponible"},
                status=HTTPStatus.BAD_REQUEST
            )

        try:
            rol = Gestion.objects.get(rol=request.data['id_rol'])

            # Crear usuario en auth_user
            usuario_auth = User.objects.create_user(
                username=request.data['email'],
                email=request.data['email'],
                password=request.data['contraseña'],
                first_name=request.data['nombres'],
                last_name=request.data['apellidos']
            )

            # Si el rol es Admin => otorgar privilegios
            if rol.rol.lower() == "admin":
                usuario_auth.is_superuser = True
                usuario_auth.is_staff = True
                usuario_auth.save()

            # Crear usuario en tu tabla personalizada
            nuevo_usuario = Users.objects.create(
                documento=request.data['documento'],
                nombres=request.data['nombres'],
                apellidos=request.data['apellidos'],
                telefono=request.data['telefono'],
                email=request.data['email'],
                direccion=request.data['direccion'],
                contraseña=request.data['contraseña'],
                estado=request.data['estado'],
                id_rol=rol,
                
            )

            return JsonResponse({
                "documento": nuevo_usuario.documento,
                "nombres": nuevo_usuario.nombres,
                "apellidos": nuevo_usuario.apellidos,
                "email": nuevo_usuario.email,
                "estado": nuevo_usuario.estado,
                "id_rol": nuevo_usuario.id_rol.rol
            }, status=HTTPStatus.CREATED)


        except Exception as e:
            return JsonResponse(
                {"estado": "error", "mensaje": str(e)},
                status=HTTPStatus.INTERNAL_SERVER_ERROR
            )



class classContar(APIView):
    
    def get(self,request):
        total_usuarios = User.objects.filter(is_active=True).count()
        return JsonResponse({"total_usuarios": total_usuarios}, status=HTTPStatus.OK)
        
        
class classRegister(APIView):
    def post(self,request):
        
        
        
        #validaciones de obligacion
        campos_usuario = {
        "documento": "El documento es obligatorio",
        "nombres": "El nombre es obligatorio",
        "apellidos": "El apellido es obligatorio",
        "telefono": "El número de teléfono es obligatorio",
        "email": "El correo electrónico es obligatorio",
        "direccion": "La dirección es obligatoria",
    }
        
        #acceder al primer indice de usuarios
        for campo,mensaje in campos_usuario.items():
            valor=request.data.get(campo)
            if valor is None or valor=="":
                return JsonResponse(
                {"estado":"error","mensaje":mensaje},
                status=HTTPStatus.BAD_REQUEST)
            
        
        
        #validacion de si el documento no existe
        if Users.objects.filter(documento=request.data.get("documento")).exists():
            return JsonResponse ({"estado":"error","mensaje":f"El documento {request.data ['documento']} ya esta registrado"},
                                status=HTTPStatus.BAD_REQUEST)
                                    
        #validacion de si el correo no existe
        if Users.objects.filter(email=request.data.get("email")).exists():
            return JsonResponse ({"estado":"error","mensaje":f"El correo {request.data['email']} no esta disponible"},
                                status=HTTPStatus.BAD_REQUEST)
        
        
        token=str(uuid.uuid4())
        url =url = f"http://127.0.0.1:5501/YoungStyle/sesion/sesion_cliente.html?token={token}"
        print("🔗 Enlace de recuperación:", url)
        
        try:
            rol = Gestion.objects.get(rol="cliente")
            print(request.data)
            nuevo_usuario=Users.objects.create(documento=request.data['documento'],
                                nombres=request.data['nombres'],
                                apellidos=request.data['apellidos'],
                                telefono=request.data['telefono'],
                                email=request.data['email'],
                                direccion=request.data['direccion'],
                                id_rol=rol,
                                contraseña=request.data['contraseña'])
            usuario=User.objects.create_user(
                username=nuevo_usuario.email,
                email=nuevo_usuario.email,
                password=nuevo_usuario.contraseña,
                first_name=nuevo_usuario.nombres,
                last_name=nuevo_usuario.apellidos,
                is_active=False
            )
            UserMetadataU.objects.create(token=token,user_id=usuario.id)
            
            send_mail(
            subject='Verificación de cuenta',
            message=f'Por favor verifica tu cuenta ingresando al siguiente enlace: {url}',
            from_email=os.getenv("EMAIL_HOST_USER"),
            recipient_list=[request.data["email"]],
            fail_silently=False,
            )
            
            return JsonResponse({
                "esteado":"ok","Mensaje":"Registrado con exito"}, status=HTTPStatus.CREATED)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    


class PerfilUsuario(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = User.objects.get(id=request.user.id)
        try:
            usuario_extra = Users.objects.get(email=user.email)
            direccion = usuario_extra.direccion
            telefono = usuario_extra.telefono
        except Users.DoesNotExist:
            direccion = None
            telefono = None

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "direccion": direccion,
            "telefono": telefono
        })



class classdeletePut(APIView):
    def get(self,request,documento):
        try:
            dato=Users.objects.filter(documento=documento).get()
            
            return JsonResponse({"data": {"documento":dato.documento,
                                        "nombres":dato.nombres,
                                        "apellidos":dato.apellidos,
                                        "telefono":dato.telefono,
                                        "email":dato.email,
                                        "direccion":dato.direccion,
                                        "estado:" :dato.estado}})
        except Users.DoesNotExist:
            raise Http404
        



    
    def put(self, request, documento):
            try:
                # Buscar el usuario en tu modelo principal Users
                usuario_django = Users.objects.filter(documento=documento).first()
                if not usuario_django:
                    return Response({'error': 'Usuario no encontrado'}, status=404)

                # Buscar usuario en auth_user por email actual
                usuario_auth = User.objects.filter(email=usuario_django.email).first()

                # ===============================
                #  Actualizar datos básicos
                # ===============================
                usuario_django.nombres = request.data.get('nombres', usuario_django.nombres)
                usuario_django.apellidos = request.data.get('apellidos', usuario_django.apellidos)
                usuario_django.telefono = request.data.get('telefono', usuario_django.telefono)
                usuario_django.direccion = request.data.get('direccion', usuario_django.direccion)

                # ===============================
                #  Actualizar contraseña
                # ===============================
                if request.data.get('contraseña'):
                    usuario_django.contraseña = request.data.get('contraseña')
                    if usuario_auth:
                        usuario_auth.set_password(request.data.get('contraseña'))

                # ===============================
                # Verificar cambio de email
                # ===============================
                nuevo_email = request.data.get('email')
                if nuevo_email and usuario_django.email != nuevo_email:
                    if User.objects.filter(email=nuevo_email).exclude(id=usuario_auth.id if usuario_auth else None).exists():
                        return Response({'error': 'Ya existe otro usuario con ese correo electrónico'}, status=400)

                    usuario_django.email = nuevo_email
                    if usuario_auth:
                        usuario_auth.email = nuevo_email
                        usuario_auth.username = nuevo_email

                # ===============================
                # Verificar cambio de rol
                # ===============================
                nuevo_rol = request.data.get('id_rol')
                if nuevo_rol and usuario_django.id_rol.rol != nuevo_rol:
                    rol = Gestion.objects.get(rol=nuevo_rol)
                    usuario_django.id_rol = rol

                    if usuario_auth:
                        if rol.rol.lower() == "admin":
                            usuario_auth.is_superuser = True
                            usuario_auth.is_staff = True
                        else:
                            usuario_auth.is_superuser = False
                            usuario_auth.is_staff = False
                            
                # ===============================
                # 🔹 Verificar cambio de estado (corregido)
                # ===============================
                nuevo_estado = request.data.get('estado')
                if nuevo_estado:
                    nuevo_estado = nuevo_estado.strip().lower()
                    # Guardamos capitalizado en Users
                    usuario_django.estado = nuevo_estado.capitalize()
                    # Sincronizamos con auth_user
                    if usuario_auth:
                        usuario_auth.is_active = (nuevo_estado == "activo")

                # ===============================
                # Guardar cambios
                # ===============================
                usuario_django.save()
                if usuario_auth:
                    usuario_auth.save()

                return Response({
                    "documento": usuario_django.documento,
                    "nombres": usuario_django.nombres,
                    "apellidos": usuario_django.apellidos,
                    "email": usuario_django.email,
                    "estado": usuario_django.estado,
                    "id_rol": usuario_django.id_rol.rol if usuario_django.id_rol else None,
                    "telefono": usuario_django.telefono,
                    "direccion": usuario_django.direccion,
                    "contraseña": usuario_django.contraseña
                }, status=200)

            except Exception as e:
                return Response({'error': str(e)}, status=500)

