from rest_framework.views import APIView
from django.http.response import JsonResponse
from http import HTTPStatus
from django.http import Http404
from .models import Carrito, itemcarrito
from productos.models import Productos
from .serializers import ItemCarritoSerializer
from datetime import datetime

# Clase para agregar y ver todos los ítems del carrito
class Carrito1(APIView):
    def get_carrito(self, request):
        if request.user.is_authenticated:
            carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.save()
                session_key = request.session.session_key
            carrito, _ = Carrito.objects.get_or_create(session_key=session_key)
        return carrito

    def get(self, request):
        carrito = self.get_carrito(request)
        items = itemcarrito.objects.filter(carrito=carrito).order_by('-id')
        serializer = ItemCarritoSerializer(items, many=True)
        return JsonResponse({"data": serializer.data}, status=HTTPStatus.OK)

    def post(self, request):
        try:
            data = request.data if isinstance(request.data, dict) else json.loads(request.body)
            productos = data.get("productos", [])

            if not productos:
                return JsonResponse({"estado": "error", "mensaje": "No se recibieron productos"}, status=HTTPStatus.BAD_REQUEST)

            carrito = self.get_carrito(request)

            for producto_data in productos:
                nombre = producto_data.get("nombre")
                cantidad = int(producto_data.get("cantidad", 1))

                try:
                    producto = Productos.objects.get(nombre__iexact=nombre)
                except Productos.DoesNotExist:
                    continue  # o manejar como error

                item, creado = itemcarrito.objects.get_or_create(carrito=carrito, producto=producto)
                if not creado:
                    item.cantidad += cantidad
                else:
                    item.cantidad = cantidad

                item.save()

            return JsonResponse({"estado": "ok", "mensaje": "Productos agregados al carrito"}, status=HTTPStatus.CREATED)

        except Exception as e:
            return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)

    
# Clase para manejar ítems del carrito por ID
class Carrito2(APIView):
    def get_carrito(self, request):
        if request.user.is_authenticated:
            carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.save()
                session_key = request.session.session_key
            carrito, _ = Carrito.objects.get_or_create(session_key=session_key)
        return carrito

    def get(self, request, id):
        carrito = self.get_carrito(request)
        try:
            item = itemcarrito.objects.get(id=id, carrito=carrito)
            serializer = ItemCarritoSerializer(item)
            return JsonResponse({"data": serializer.data}, status=HTTPStatus.OK)
        except itemcarrito.DoesNotExist:
            return JsonResponse({"estado": "error", "mensaje": "Ítem no encontrado"}, status=HTTPStatus.NOT_FOUND)

    def put(self, request, id):
        carrito = self.get_carrito(request)
        cantidad = int(request.data.get("cantidad", 1))

        try:
            item = itemcarrito.objects.get(id=id, carrito=carrito)
            item.cantidad = cantidad
            item.save()
            return JsonResponse({"estado": "ok", "mensaje": "Cantidad actualizada"}, status=HTTPStatus.OK)
        except itemcarrito.DoesNotExist:
            return JsonResponse({"estado": "error", "mensaje": "Ítem no encontrado"}, status=HTTPStatus.NOT_FOUND)

    def delete(self, request, id):
        carrito = self.get_carrito(request)
        try:
            item = itemcarrito.objects.get(id=id, carrito=carrito)
            item.delete()
            return JsonResponse({"estado": "ok", "mensaje": "Producto eliminado"}, status=HTTPStatus.OK)
        except itemcarrito.DoesNotExist:
            return JsonResponse({"estado": "error", "mensaje": "Ítem no encontrado"}, status=HTTPStatus.NOT_FOUND)