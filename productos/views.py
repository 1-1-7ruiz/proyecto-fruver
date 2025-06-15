from django.shortcuts import render
from rest_framework.views import APIView, Response
from django.http.response import JsonResponse
from .models import *
from .serializers import *
from http import HTTPStatus
from django.http import Http404

class classproductos1(APIView):
    
    def get(self,request):
        data=Productos.objects.all()
        
        datos_json=categoriaserializer(data,many=True)
        
        return JsonResponse(datos_json.data,status=HTTPStatus.OK)
    
    def post(self,request):
        if not all([
            request.data.get('nombre'),
            request.data.get('stock'),
            request.data.get('precio')
            
        ]):
            return JsonResponse({"Estado":"error","mensaje":"Todos los parametros deben ir llenos"},status=HTTPStatus.BAD_REQUEST)
        try:
            Productos.objects.create(nombre=request.data['nombre'],stock=request.data['stock'],precio=request.data['precio'])
            return JsonResponse({"estado":"ok","mensaje":"se creo el registro correctamente"},status=HTTPStatus.CREATED)
        except Exception as e:
            raise Http404

class classproductos2(APIView):
    def get(self,request,id):
        try:
            data=Productos.objects.filter(id=id).get()
            return JsonResponse({"data":{"id":data.id,"nombre":data.nombre,"stock":data.stock,"precio":data.precio}},status=HTTPStatus.OK)
        except Productos.DoesNotExist:
            raise Http404
        
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
                                                            precio=request.data.get('precio'))
            return JsonResponse({"Estado":"ok","mensaje":"Producto modificado correctamente"},status=HTTPStatus.OK)
        except Productos.DoesNotExist:
            raise Http404
        
    def delete(self,request,id):
        try:
            usuario=Productos.objects.get(id=id)
            usuario.delete()
            return JsonResponse({"Estado":"Ok","Mnesaje":"Producto eliminado correctamente"},status=HTTPStatus.OK)
        except  Productos.DoesNotExist:
            raise Http404