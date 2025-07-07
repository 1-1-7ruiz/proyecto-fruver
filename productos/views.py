from django.shortcuts import render
from rest_framework.views import APIView, Response
from django.http.response import JsonResponse
from .models import *
from .serializers import *
from http import HTTPStatus
from django.http import Http404
from datetime import datetime
import os
from django.core.files.storage import FileSystemStorage
from seguridad.decorators import logueado

class classproductos1(APIView):
    
    def get(self,request):
        data=Productos.objects.all()
        
        datos_json=Productoserializer(data,many=True)
        
        return Response(datos_json.data,status=HTTPStatus.OK)
    
    @logueado()
    def post(self,request):
        if not all([
            request.data.get('nombre'),
            request.data.get('stock'),
            request.data.get('precio')
            
        ]):
            return JsonResponse({"Estado":"error","mensaje":"Todos los parametros deben ir llenos"},status=HTTPStatus.BAD_REQUEST)
        
        fs=FileSystemStorage()
        try:
            archivo = request.FILES['foto']
            extension = os.path.splitext(archivo.name)[1]  # obtiene ".jpg" por ejemplo
            foto = f"{datetime.timestamp(datetime.now())}{extension}"
        except Exception as e:
            return JsonResponse({
                "estado": "error",
                "mensaje": "Debe adjuntar una foto en el campo files"
    }, status=HTTPStatus.BAD_REQUEST)
        
        if request.FILES["foto"].content_type=="image/jpeg" or request.FILES["foto"].content_type=="image/png":
        
            try:
                fs.save(f"productos/{foto}",request.FILES['foto'])
                fs.url(request.FILES['foto'])
            except Exception as e:
                return JsonResponse({"estado":"error","mensaje":"se produjo un error al intentar subir el archivo"},status=HTTPStatus.BAD_REQUEST)
                
                
        
        try:
            Productos.objects.create(nombre=request.data['nombre'],
                                    stock=request.data['stock'],
                                    precio=request.data['precio'],
                                    categoria_id=request.data['categoria'],
                                    foto= foto)
            return JsonResponse({"estado":"ok","mensaje":"se creo el registro correctamente"},status=HTTPStatus.CREATED)
        except Exception as e:
            raise Http404

class classproductos2(APIView):
    
    @logueado()    
    def put(self,request,id):
        
        if not all([
            request.data.get('nombre'),
            request.data.get('stock'),
            request.data.get('precio')
        ]):
            return JsonResponse({"Estado":"error","Mensaje":"campos obligatorios"},status=HTTPStatus.BAD_REQUEST)
        try:
            Productos.objects.filter(id=id).update(nombre=request.data.get('nombre'),
                                                            stock=request.data.get('stock'),
                                                            precio=request.data.get('precio'),
                                                            categoria_id=request.data.get('categoria'))
            return JsonResponse({"Estado":"ok","mensaje":"Producto modificado correctamente"},status=HTTPStatus.OK)
        except Productos.DoesNotExist:
            raise Http404
    
    @logueado()    
    def delete(self,request,id):
        try:
            usuario=Productos.objects.get(id=id)
            usuario.delete()
            return JsonResponse({"Estado":"Ok","Mnesaje":"Producto eliminado correctamente"},status=HTTPStatus.OK)
        except  Productos.DoesNotExist:
            raise Http404