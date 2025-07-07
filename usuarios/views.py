from django.shortcuts import render
from rest_framework.views import APIView, Response
from django.http.response import JsonResponse
from .models import *
from .serializers import *
from http import HTTPStatus
from django.http import Http404
# Create your views here.

class classUser(APIView):
    
    def get(self,request):
        usuario= User.objects.all()
        
        usuario_serializado=UserSerializer(usuario,many=True)
        
        rolPermisos=Gestion.objects.all()
        
        rol_serializado=GestionSerializer(rolPermisos,many=True)
                
        return Response({
            "usuario":usuario_serializado.data,
            "rol":rol_serializado.data
            
        },status=HTTPStatus.OK)
    
    def post(self,request):
        
        
        
        #validaciones de obligacion
        campos_usuario = {
        "documento": "El documento es obligatorio",
        "nombres": "El nombre es obligatorio",
        "apellidos": "El apellido es obligatorio",
        "fecha_nacimiento": "La fecha de nacimiento es obligatoria",
        "telefono": "El número de teléfono es obligatorio",
        "email": "El correo electrónico es obligatorio",
        "id_rol": "El rol es obligatorio",
        "direccion": "La dirección es obligatoria",
        "estado": "El estado es obligatorio"
    }
        
        #acceder al primer indice de usuarios
        for campo,mensaje in campos_usuario.items():
            valor=request.data.get(campo)
            if valor is None or valor=="":
                return JsonResponse(
                {"estado":"error","mensaje":mensaje},
                status=HTTPStatus.BAD_REQUEST)
            
        
        
        #validacion de si el documento no existe
        if User.objects.filter(documento=request.data.get("documento")).exists():
            return JsonResponse ({"estado":"error","mensaje":f"El documento {request.data ['documento']} ya esta registrado"},
                                status=HTTPStatus.BAD_REQUEST)
                                    
        #validacion de si el correo no existe
        if User.objects.filter(email=request.data.get("email")).exists():
            return JsonResponse ({"estado":"error","mensaje":f"El correo{request.data['email']} no esta disponible"},
                                status=HTTPStatus.BAD_REQUEST)
        
        
        try:
            rol = Gestion.objects.get(rol=request.data['id_rol'])
            print(request.data)
            nuevo_usuario=User.objects.create(documento=request.data['documento'],
                                nombres=request.data['nombres'],
                                apellidos=request.data['apellidos'],
                                fecha_nacimiento=request.data['fecha_nacimiento'],
                                telefono=request.data['telefono'],
                                email=request.data['email'],
                                direccion=request.data['direccion'],
                                estado=request.data['estado'],
                                id_rol=rol,
                                contraseña=request.data['contraseña'])
            return JsonResponse({
            "documento": nuevo_usuario.documento,
            "nombres": nuevo_usuario.nombres,
            "apellidos": nuevo_usuario.apellidos,
            "email": nuevo_usuario.email,
            "estado": nuevo_usuario.estado,
            "id_rol": nuevo_usuario.id_rol.rol  
}, status=HTTPStatus.CREATED)
        except Exception as e:
            
            raise Http404

class classdeletePut(APIView):
    def get(self,request,documento):
        try:
            dato=User.objects.filter(documento=documento).get()
            
            return JsonResponse({"data": {"documento":dato.documento,
                                        "nombres":dato.nombres,
                                        "apellidos":dato.apellidos,
                                        "fecha nacimiento":dato.fecha_nacimiento,
                                        "telefono":dato.telefono,
                                        "email":dato.email,
                                        "direccion":dato.direccion,
                                        "estado:" :dato.estado}})
        except User.DoesNotExist:
            raise Http404
        
    def put(self,request,documento):
        
        if not all([
            request.data.get('nombres'),
            request.data.get('apellidos'),
            request.data.get('fecha_nacimiento'),
            request.data.get('telefono'),
            request.data.get('email'),
            request.data.get('id_rol'),
            request.data.get('nombre_completo'),
            request.data.get('direccion'),
            request.data.get('estado')
        ]):
            return JsonResponse({"Estado":"error","Mensaje":"campos obligatorios"},status=HTTPStatus.BAD_REQUEST)
        try:
            User.objects.filter(documento=documento).update(nombre_completo=request.data.get('nombres'),
                                                            apellidos=request.data.get('apellidos'),
                                                            fecha_nacimiento=request.data.get('fecha_nacimiento'),
                                                            telefono=request.data.get('telefono'),
                                                            email=request.data.get('email'),
                                                            id_rol=request.data.get('id_rol'),
                                                            direccion=request.data.get('direccion'),
                                                            estado=request.data.get('estado'))
            return JsonResponse({"Estado":"ok","mensaje":"Usuario modificado correctamente"},status=HTTPStatus.OK)
        except User.DoesNotExist:
            raise Http404
    def delete(self,request,documento):
        try:
            usuario=User.objects.get(documento=documento)
            usuario.delete()
            return JsonResponse({"Estado":"Ok","Mnesaje":"Usuario eliminado correctamente"},status=HTTPStatus.OK)
        except User.DoesNotExist:
            raise Http404