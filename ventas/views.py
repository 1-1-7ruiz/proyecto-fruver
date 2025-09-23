from django.shortcuts import render
from rest_framework.views import APIView,Response
from .serializers import *
from .models import *
from django.conf import settings
from http import HTTPStatus
from django.http.response import JsonResponse,HttpResponse
from django.http import Http404
from datetime import datetime
from django.utils.dateformat import DateFormat
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate,Paragraph,Image,Table,TableStyle,Spacer
from reportlab.lib.styles import getSampleStyleSheet
from productos.models import Productos
from reportlab.lib import colors
import os
from django.db import transaction

from django.db.models import Sum

from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from django.core.mail import EmailMessage
from io import BytesIO


# Create your views here.

class classVenta(APIView):
    def get(self, request):
        
        ventas = Venta.objects.all()

        # ================= FILTROS ================= #
        
        nombre_cliente = request.GET.get("cliente")
        documento = request.GET.get("documento")

        if nombre_cliente:
            ventas = ventas.filter(documento__nombres__icontains=nombre_cliente)

        if documento:
            ventas = ventas.filter(documento__documento__icontains=documento)

        mes = request.GET.get("mes")
        fecha_exacta = request.GET.get("fecha")
        fecha_min = request.GET.get("min")
        fecha_max = request.GET.get("max")

        if mes:
            try:
                anio, mes_num = mes.split("-")
                ventas = ventas.filter(
                    fecha_venta__year=anio,
                    fecha_venta__month=mes_num
                )
            except Exception:
                pass

        if fecha_exacta:
            try:
                ventas = ventas.filter(fecha_venta=fecha_exacta)
            except Exception:
                pass

        if fecha_min and fecha_max:
            try:
                ventas = ventas.filter(
                fecha_venta__range=[fecha_min, fecha_max]
                )   
            except Exception:
                pass

        # ============================================ #

        ventas_serializadas = VentaSerializer(ventas, many=True)
        detalles = Detalle_v.objects.filter(venta__in=ventas)
        detalles_serializadas = DetalleSerializer(detalles, many=True)

        return Response({
            "ventas": ventas_serializadas.data,
            "detalles": detalles_serializadas.data
        }, status=HTTPStatus.OK)

    
    def post(self, request):
        ventas = request.data.get('ventas')
        detalles = request.data.get('detalles')

        if not ventas or not detalles:
            return JsonResponse(
                {"estado": "error", "mensaje": "Debe incluir ventas y detalles"},
                status=HTTPStatus.BAD_REQUEST
            )

        try:
            with transaction.atomic():
                venta_data = ventas[0]
                documento = Users.objects.get(documento=venta_data['documento'])

                # 🔎 1. Validar stock ANTES de crear la venta
                for detalle in detalles:
                    producto = Productos.objects.get(id=detalle['id_producto'])
                    if producto.stock < int(detalle['cantidad']):
                        return JsonResponse(
                            {"estado": "error",
                            "mensaje": f"Stock insuficiente para {producto.nombre} : {producto.stock} unidades"},
                            status=HTTPStatus.BAD_REQUEST
                        )

                # Crear la venta SOLO si todos los productos tienen stock
                venta = Venta.objects.create(
                    fecha_venta=datetime.now(),
                    metodo_pago=venta_data['metodo_pago'],
                    documento=documento
                )

                # 3. Descontar stock y crear detalles
                for detalle in detalles:
                    producto = Productos.objects.get(id=detalle['id_producto'])
                    producto.stock -= int(detalle['cantidad'])
                    producto.save()

                    Detalle_v.objects.create(
                        cantidad=detalle['cantidad'],
                        precio_u=detalle['precio_u'],
                        producto=producto,
                        venta=venta
                    )

                


            # ================== 📄 GENERAR PDF EN MEMORIA ================== #
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=60, bottomMargin=40)
            elements = []
            styles = getSampleStyleSheet()

            estilo_centrado = ParagraphStyle(name="Centrado", parent=styles["Normal"], alignment=1, fontSize=12)

            elements.append(Paragraph("<b>Detalle de venta</b>", estilo_centrado))
            elements.append(Paragraph("<b>FRUVERSTYLE</b>", estilo_centrado))
            elements.append(Paragraph(f"Cliente: {venta.documento.nombres}", styles["Normal"]))
            elements.append(Paragraph(f"Dirección: {venta.documento.direccion}", styles["Normal"]))
            elements.append(Spacer(1, 20))

            data_table = [["Producto", "Cantidad", "Precio unitario", "Total"]]
            detalles_v = Detalle_v.objects.filter(venta=venta)
            total = 0
            for d in detalles_v:
                data_table.append([
                    d.producto.nombre,
                    str(d.cantidad),
                    f"${d.precio_u:,.0f}",
                    f"${d.sub_total:,.0f}"
                ])
                total += d.sub_total
            data_table.append(["", "", "Total a pagar:", f"${total:,.0f}"])

            table = Table(data_table, colWidths=[180, 80, 120, 120])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4CAF50")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            elements.append(table)

            doc.build(elements)
            pdf = buffer.getvalue()
            buffer.close()

            # ================== 📧 ENVIAR EMAIL CON PDF ================== #
            email = EmailMessage(
                subject="Comprobante de tu compra",
                body="Gracias por tu compra en Fruverstyle. Te adjuntamos tu comprobante en PDF.",
                from_email=os.getenv("EMAIL_HOST_USER"),
                to=[documento.email],
            )
            email.attach(f"venta_{venta.id}.pdf", pdf, "application/pdf")
            email.send()

            return JsonResponse({"estado": "ok", "mensaje": "Venta creada y comprobante enviado"}, status=HTTPStatus.CREATED)

        except Exception as e:
            return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.BAD_REQUEST)
            


class classContar(APIView):
    def get(self,request):
        try:
            total_ventas = Venta.objects.count()
            return JsonResponse({"total_ventas": total_ventas}, status=HTTPStatus.OK)
        except Exception as e:
            return JsonResponse({"estado": "error", "mensaje": str(e)}, status=HTTPStatus.BAD_REQUEST)
        

class classventa2(APIView):
    
    def get(self,request,id):
        try:
            venta=Venta.objects.filter(id=id).get()
            detalles=Detalle_v.objects.filter(venta=venta)

            data= {
                "id": venta.id,
                "usuario_id": str(venta.documento),
                "usuario": str(venta.documento.nombres),
                "direccion": str(venta.documento.direccion),
                "fecha_venta": DateFormat(venta.fecha_venta).format('d/m/Y'),
                "metodo_pago": venta.metodo_pago,
                "total": float(venta.total),
                "detalles": []
            }

            for i in detalles:
                data["detalles"].append({
                    "producto_id":i.producto.id,
                    "producto":i.producto.nombre,
                    "cantidad":float(i.cantidad),
                    "precio_unitario": float(i.precio_u),
                    "sub_total":float(i.sub_total)
                })

            return JsonResponse({"data":data},status=HTTPStatus.OK)
        except Venta.DoesNotExist:
            raise Http404
            
            

class classPDF(APIView):
    def get(self, request, id):
        try:
            venta = Venta.objects.get(id=id)
            detalles = Detalle_v.objects.filter(venta=venta)
        except Venta.DoesNotExist:
            return HttpResponse("Venta no encontrada", status=404)

        buffer = BytesIO()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=venta_{venta.id}.pdf'

        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=40, leftMargin=40,
                                topMargin=60, bottomMargin=40)

        elements = []
        styles = getSampleStyleSheet()

        # 👇 Logo
        logo_path = os.path.join(settings.BASE_DIR, "static", "img", "logo.png")
        if os.path.exists(logo_path):
            img = Image(logo_path, width=120, height=60)
            elements.append(img)

        estilo_centrado = ParagraphStyle(
        name="Centrado",
        parent=styles["Normal"],
        alignment=1,  # 👈 centrado
        fontSize=12
        )

        elements.append(Paragraph("<b>Detalle de venta</b>", estilo_centrado))
        elements.append(Paragraph("<b>FRUVERSTYLE</b>", estilo_centrado))
        elements.append(Paragraph(f"Tel Fruverstyle: 3102412110",estilo_centrado,))

        # Info de venta
        info = f"""
        <b>Consecutivo:</b> {venta.id:06d}<br/>
        <b>Cliente:</b> {venta.documento.nombres}<br/>
        <b>Dirección:</b> {venta.documento.direccion}
        <b>Telefono cliente:</b>{venta.documento.telefono}
        """
        elements.append(Paragraph(info, styles["Normal"]))
        elements.append(Spacer(1, 20))

        # Tabla encabezado y productos
        data = [["Producto", "Cantidad", "Precio unitario", "Total"]]
        total = 0
        for d in detalles:
            data.append([
                d.producto.nombre,
                str(d.cantidad),
                f"${d.precio_u:,.0f}",
                f"${d.sub_total:,.0f}"
            ])
            total += d.sub_total

        # Agregar fila del total
        data.append(["", "", "Total a pagar:", f"${total:,.0f}"])

        table = Table(data, colWidths=[180, 80, 120, 120])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4CAF50")),  # encabezado verde
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ("BACKGROUND", (0, 1), (-1, -2), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("SPAN", (0, -1), (2, -1)),  # unir celdas para el total
            ("ALIGN", (3, -1), (3, -1), "RIGHT"),
            ("FONTNAME", (3, -1), (3, -1), "Helvetica-Bold"),
            ("TEXTCOLOR", (3, -1), (3, -1), colors.HexColor("#E53935")),
        ]))

        elements.append(table)

        # Construir PDF
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        return response
    
    
class classReporteVentas(APIView):
    def get(self, request):
        reporteVentas = Venta.objects.all()
        ventas_serializadas = VentaSerializer(reporteVentas, many=True)
        total_ventas = Venta.objects.aggregate(total=Sum("total"))["total"] or 0
        return Response({
            "total_ventas": int(total_ventas),  # sin decimales
            "ventas": ventas_serializadas.data
        }, status=HTTPStatus.OK)