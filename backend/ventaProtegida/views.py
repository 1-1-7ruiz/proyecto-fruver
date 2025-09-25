from django.shortcuts import render
from rest_framework.views import APIView
from django.http.response import JsonResponse
from rest_framework.views import Response
from http import HTTPStatus
from django.http import Http404
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.utils import dateformat
from seguridad.decorators import *
from ventas.serializers import *
from ventas.models import *
# Create your views here.

class classProtegida(APIView):

    @method_decorator(logueado())
    def get(self,request,documento):
        
        try:
            existe=User.objects.filter(documento=documento).first()
        except User.DoesNotExist:
            return JsonResponse({"estado":"error","mensaje":"Ocurrio un error inesperado"})
        
        
        
        ventas = Venta.objects.all()
        ventas_serializadas = VentaSerializer(ventas, many=True)
        detalles = Detalle_v.objects.all()
        detalles_serializadas = DetalleSerializer(detalles, many=True)
        return Response({
            "ventas": ventas_serializadas.data,
            "detalles": detalles_serializadas.data
        }, status=HTTPStatus.OK)


#listar las ultimas tres ventas
class ventas3(APIView):
    
    def get(self,reques):
        ventas=Venta.objects.order_by('-id').all()[:3]
        ventas_serializadas = VentaSerializer(ventas, many=True)
        
        return Response({
            "ventas": ventas_serializadas.data,
            
        }, status=HTTPStatus.OK)


class ventas4(APIView):
    def get(self,request):
        if request.GET.get("categoria_id")==None or not request.GET.get("categoria_id"):
            return JsonResponse({"Estado":"Error","Mensaje":"Ocurrio un error inesperado"},status=HTTPStatus.BAD_REQUEST)
        #si exite la categoria
    
        try:
            existe=Categoria.objects.filter(id=request.GET.get("categoria_id")).get()
        except Categoria.DoesNotExist:
            return JsonResponse({"Estado":"Error","Mensaje":"Ocurrio un error inesperado"},status=HTTPStatus.BAD_REQUEST)
        

        detalle=Detalle_v.objects.filter(producto_categoria=existe).order_by('-id')
        data=[]

        for i in detalle:
            data.append({
                "venta_id":i.venta.id,
                "producto_id":i.producto.id,
                "producto":i.producto.nombre,
                "cantidad":float(i.cantidad),
                "precio_unitario":float(i.precio_u),
                "sub_total":float(i.sub_total),
                "fecha_venta":dateformat(i.venta.fecha_venta).format('d/m/Y'),
                "metodo_pago":i.venta.metodo_pago,
                "total_venta":float(i.venta.total),
                "usuario":i.venta.documento.nombres
            })

            return JsonResponse ({"data":data},status=HTTPStatus.OK)
