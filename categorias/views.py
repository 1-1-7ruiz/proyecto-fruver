from django.shortcuts import render
from rest_framework.views import APIView, Response
from django.http.response import JsonResponse
from .models import Categoria
from .serializers import *
from http import HTTPStatus
from django.http import Http404

class classcategoria(APIView):
    
    def get(self,request):
        data= Categoria.objects.all()
        
        datos_json=Categoriaserializer(data,many=True)
        
        return Response({f"nombre":datos_json.data},status=HTTPStatus.OK)
    

    def post(self,request):
        if not all([
            request.data.get('nom_categoria')
        ]):
            return JsonResponse({"Estado":"error","mensaje":"Todos los parametros deben ir llenos"},status=HTTPStatus.BAD_REQUEST)
        try:
            Categoria.objects.create(nom_categoria=request.data['nom_categoria'])
            return JsonResponse({"estado":"ok","mensaje":"se creo el registro correctamente"},status=HTTPStatus.CREATED)
        except Exception as e:
            raise Http404
        
class classcategoria2(APIView):
    def get(self,request,id):
        try:
            data=Categoria.objects.filter(id=id).get()
            return JsonResponse({"data":{"nom_categoria":data.nom_categoria}},status=HTTPStatus.OK)
        except Categoria.DoesNotExist:
            raise Http404
        
    def put(self,request,id):
        
        if not all([
            request.data.get('nom_categoria'),
        ]):
            return JsonResponse({"Estado":"error","Mensaje":"campos obligatorios"},status=HTTPStatus.BAD_REQUEST)
        try:
            Categoria.objects.filter(id=id).update(nom_categoria=request.data.get('nom_categoria'))
            return JsonResponse({"Estado":"ok","mensaje":"Usuario modificado correctamente"},status=HTTPStatus.OK)
        except Categoria.DoesNotExist:
            raise Http404
        

    def delete(self,request,id):
        try:
            usuario=Categoria.objects.get(id=id)
            usuario.delete()
            return JsonResponse({"Estado":"Ok","Mensaje":"Usuario eliminado correctamente"},status=HTTPStatus.OK)
        except Categoria.DoesNotExist:
            raise Http404