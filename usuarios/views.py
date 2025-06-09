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
        data= User.objects.all()
        
        datos_json=UserSerializer(data,many=True)
        
        return Response(datos_json.data,status=HTTPStatus.OK)
    
    def post(self,request):
        if not all([
            request.data.get('documento'),
            request.data.get('nombre_completo'),
            request.data.get('fecha_nacimiento'),
            request.data.get('telefono'),
            request.data.get('email'),
            request.data.get('id_rol'),
            request.data.get('nombre_completo'),
            request.data.get('direccion')
            
        ]):
            return JsonResponse({"Estado":"error","mensaje":"Todos los parametros deben ir llenos"},status=HTTPStatus.BAD_REQUEST)
        try:
            rol = Gestion.objects.get(rol=request.data['id_rol'])
            User.objects.create(documento=request.data['documento'],
                                nombre_completo=request.data['nombre_completo'],
                                fecha_nacimiento=request.data['fecha_nacimiento'],
                                telefono=request.data['telefono'],
                                email=request.data['email'],
                                slug=request.data['nombre_completo'],
                                id_rol=rol,
                                direccion=request.data['direccion'])
            return JsonResponse({"Estado":"ok","Mensaje":"Usuario añadido con exito"},status=HTTPStatus.CREATED)
        except Exception as e:
            
            raise Http404

class classdeletePut(APIView):
    def get(self,request,documento):
        try:
            dato=User.objects.filter(documento=documento).get()
            
            return JsonResponse({"data": {"documento":dato.documento,
                                        "nombre completo":dato.nombre_completo,
                                        "fecha nacimiento":dato.fecha_nacimiento,
                                        "telefono":dato.telefono,
                                        "email":dato.email,
                                        "direccion":dato.direccion}})
        except User.DoesNotExist:
            raise Http404
        
    def put(self,request,documento):
        
        if not all([
            request.data.get('nombre_completo'),
            request.data.get('fecha_nacimiento'),
            request.data.get('telefono'),
            request.data.get('email'),
            request.data.get('id_rol'),
            request.data.get('nombre_completo'),
            request.data.get('direccion')
        ]):
            return JsonResponse({"Estado":"error","Mensaje":"campos obligatorios"},status=HTTPStatus.BAD_REQUEST)
        try:
            User.objects.filter(documento=documento).update(nombre_completo=request.data.get('nombre_completo'),
                                                            fecha_nacimiento=request.data.get('fecha_nacimiento'),
                                                            telefono=request.data.get('telefono'),
                                                            email=request.data.get('email'),
                                                            slug=request.data.get('nombre_completo'),
                                                            id_rol=request.data.get('id_rol'),
                                                            direccion=request.data.get('direccion'))
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