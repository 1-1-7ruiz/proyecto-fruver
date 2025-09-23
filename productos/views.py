from django.shortcuts import render
from rest_framework.views import APIView, Response
from django.http.response import JsonResponse
from .models import *
from django.db.models import Q
from .serializers import *
from http import HTTPStatus
from django.http import Http404
from datetime import datetime
import os
from django.core.files.storage import FileSystemStorage
from seguridad.decorators import logueado





from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from http import HTTPStatus
from .models import Productos
from .serializers import Productoserializer

class classproductos1(APIView):
    def get(self, request):
        try:
            # Base query
            productos = Productos.objects.all().order_by('-id')

            # Búsqueda rápida
            buscar = request.GET.get('buscar', '').strip()
            if buscar:
                productos = productos.filter(
                    Q(nombre__icontains=buscar)
                )

            # Búsqueda avanzada
            nombre = request.GET.get('nombre', '').strip()
            categoria = request.GET.get('categoria', '').strip()
            precio_max = request.GET.get('precio_max', '').strip()
            precio_min = request.GET.get('precio_min', '').strip()

            if nombre:
                productos = productos.filter(nombre__icontains=nombre)
            if categoria:
                productos = productos.filter(categoria__id=categoria)
            if categoria and categoria not in ["0", ""]:
                try:
                    categoria_int = int(categoria)
                    productos = productos.filter(categoria__id=categoria_int)
                except ValueError:
                    pass 
            if precio_max:
                productos = productos.filter(precio__lte=precio_max)
            if precio_min:
                productos = productos.filter(precio__gte=precio_min)

            # Serializar y responder
            serializer = Productoserializer(productos, many=True)
            return Response(serializer.data, status=HTTPStatus.OK)

        except Exception as e:
            return Response(
                {"estado": "error", "mensaje": str(e)},
                status=HTTPStatus.INTERNAL_SERVER_ERROR
            )

    
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
            
            estado = request.data.get('estado', 'activo')
            stock = int(request.data['stock'])
            if stock =="0":
                estado = 'inactivo'
                
            producto=Productos.objects.create(nombre=request.data['nombre'],
                                    stock=request.data['stock'],
                                    precio=request.data['precio'],
                                    categoria_id=request.data['categoria'],
                                    estado=request.data.get('estado',''),
                                    foto= f"productos/{foto}")
            return JsonResponse({
                "estado": "ok",
                "mensaje": "Se creó el registro correctamente",
                "id": producto.id,
                "nombre": producto.nombre,
                "stock": producto.stock,
                "precio": producto.precio,
                "categoria": producto.categoria_id,
                "foto": producto.foto.url if producto.foto else None
            }, status=HTTPStatus.CREATED)
        except Exception as e:
            raise Http404

class classproductos2(APIView):
    def get(self, request, id):
        try:
            producto = Productos.objects.get(id=id)
            data = {
                "id": producto.id,
                "nombre": producto.nombre,
                "stock": producto.stock,
                "precio": producto.precio,
                "categoria": producto.categoria_id,
                "foto": request.build_absolute_uri(producto.foto.url) if producto.foto else None
            }
            return JsonResponse(data, status=HTTPStatus.OK)
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
            producto = Productos.objects.get(id=id)
            
            
            

            producto.nombre = request.data.get('nombre')
            producto.stock = request.data.get('stock')
            producto.precio = request.data.get('precio')
            producto.categoria_id = request.data.get('categoria')
            producto.estado = request.data.get('estado', producto.estado)  # Mantener el estado actual si no se proporciona uno nuevo
            
            if producto.stock == "0":
                producto.estado="inacWtivo"
            else:
                producto.estado=request.data.get('estado', producto.estado)
            

            if 'foto' in request.FILES:
                producto.foto = request.FILES['foto']
            
            

            producto.save()

            return JsonResponse({"Estado": "ok", "mensaje": "Producto modificado correctamente"}, status=HTTPStatus.OK)

        except Productos.DoesNotExist:
            raise Http404
    
        
    def delete(self,request,id):
        try:
            usuario=Productos.objects.get(id=id)
            usuario.delete()
            return JsonResponse({"Estado":"Ok","Mnesaje":"Producto eliminado correctamente"},status=HTTPStatus.OK)
        except  Productos.DoesNotExist:
            raise Http404
        

class classContar(APIView):
    
    def get(self,request):
        total_productos = Productos.objects.count()
        return JsonResponse({"total_usuarios": total_productos}, status=HTTPStatus.OK)      
    
class classFrutas(APIView):
        def get(self,request):
        
            try:
                # Filtrar solo los productos que sean frutas
                data = Productos.objects.filter(categoria=1,estado="activo").order_by('-id')
                datos_json = Productoserializer(data, many=True,context={'request': request})
                return Response(datos_json.data, status=HTTPStatus.OK)
            except Exception as e:
                return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
class classFrutasP(APIView):
        def get(self,request):
        
            try:
                # Filtrar solo los productos que sean frutas
                data = Productos.objects.filter(categoria=1,estado="activo").order_by('-id')[:9]
                
                
                datos_json = Productoserializer(data, many=True,context={'request': request})
                return Response(datos_json.data, status=HTTPStatus.OK)
            except Exception as e:
                return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            
class classVerdura(APIView):
    
        def get(self,request):
            try:
                # Filtrar solo los productos que sean verduras
                data = Productos.objects.filter(categoria=2,estado="activo").order_by('-id')
                datos_json = Productoserializer(data, many=True)
                return Response(datos_json.data, status=HTTPStatus.OK)
            except Exception as e:
                return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)

class classVerduraP(APIView):
    
        def get(self,request):
            try:
                # Filtrar solo los productos que sean verduras
                data = Productos.objects.filter(categoria=2,estado="activo").order_by('-id')[:8]
                datos_json = Productoserializer(data, many=True)
                return Response(datos_json.data, status=HTTPStatus.OK)
            except Exception as e:
                return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            
            
class classLeguminosa(APIView):
    
        def get(self,request):
            try:
                # Filtrar solo los productos que sean verduras
                data = Productos.objects.filter(categoria=3,estado="activo")
                datos_json = Productoserializer(data, many=True)
                return Response(datos_json.data, status=HTTPStatus.OK)
            except Exception as e:
                return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            
class classLeguminosaP(APIView):
    
        def get(self,request):
            try:
                # Filtrar solo los productos que sean verduras
                data = Productos.objects.filter(categoria=3,estado="activo").order_by('-id')[:8]
                datos_json = Productoserializer(data, many=True)
                return Response(datos_json.data, status=HTTPStatus.OK)
            except Exception as e:
                return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)