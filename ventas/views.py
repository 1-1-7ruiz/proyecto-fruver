from django.shortcuts import render
from rest_framework.views import APIView,Response
from .serializers import *
from .models import *
from http import HTTPStatus
from django.http.response import JsonResponse
from django.http import Http404
from datetime import datetime
from django.utils.dateformat import DateFormat
# Create your views here.

class classVenta(APIView):
    def get(self, request):
        ventas = Venta.objects.all()
        ventas_serializadas = VentaSerializer(ventas, many=True)
        detalles = Detalle_v.objects.all()
        detalles_serializadas = DetalleSerializer(detalles, many=True)
        return Response({
            "ventas": ventas_serializadas.data,
            "detalles": detalles_serializadas.data
        }, status=HTTPStatus.OK)

    def post(self, request):
        
        
        ventas = request.data.get('ventas')
        detalles = request.data.get('detalles')
        
        #validaciones
        
        if not ventas or not detalles:
            return JsonResponse({
                "estado": "error",
                "mensaje": "Debe incluir ventas y detalles"
            }, status=HTTPStatus.BAD_REQUEST)
        
        camposRequeridos_venta = {
            "metodo_pago":"El campo metodo de pago es obligatorio",
            "documento":"El campo metodo de pago es obligatorio"
        }
        
        camposRequeridos_detalle= {
            "cantidad":"el campo  cantidad es obligatorio",
            "precio_u":"el campo de precio unitario es obligatorio",
            "id_producto":"el campo del id_producto es obligatorio"
        }
        
        #primero acceder al primer elemento de ventas
        datos_venta=request.data.get("ventas",[{}])[0]
        for campo,mensaje in camposRequeridos_venta.items():
            valor=datos_venta.get(campo)
            if valor is None or valor=="":
                return JsonResponse(
                    {"Estado":"error","mensaje":mensaje},
                    status=HTTPStatus.BAD_REQUEST
                )
        
        for detalle_venta in request.data.get("detalles",[]):        
            for campo,mensaje in camposRequeridos_detalle.items():
                valor=detalle_venta.get(campo)
                if valor is None or valor=="":
                    return JsonResponse(
                        {"Estado":"error","mensaje":mensaje},
                        status=HTTPStatus.BAD_REQUEST
                    )
                
        
        

        

        try:
            # Procesar la venta
            venta_data = ventas[0]
            documento = User.objects.get(documento=venta_data['documento'])
            venta = Venta.objects.create(
                fecha_venta=datetime.now(),
                metodo_pago=venta_data['metodo_pago'],
                documento=documento
            )

            # Procesar cada detalle
            for detalle in detalles:
                producto = Productos.objects.get(id=detalle['id_producto'])
                Detalle_v.objects.create(
                    cantidad=detalle['cantidad'],
                    precio_u=detalle['precio_u'],
                    producto=producto,
                    venta=venta
                )

            return JsonResponse({
                "estado": "ok",
                "mensaje": "Venta y detalles creados exitosamente"
            }, status=HTTPStatus.CREATED)

        except Exception as e:
            return JsonResponse({
                "estado": "error",
                "mensaje": str(e)
            }, status=HTTPStatus.BAD_REQUEST)
            
            

