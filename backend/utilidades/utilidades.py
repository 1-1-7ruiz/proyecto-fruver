from smtplib import SMTPResponseException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate,Paragraph,Image,Table,TableStyle,Spacer
from reportlab.lib.styles import getSampleStyleSheet
from ventas.models import *
from reportlab.lib import colors
import os

from http import HTTPStatus
from django.http.response import JsonResponse,HttpResponse
from django.http import Http404

#crear un metodo

def sendMail(html,asunto,para):
    
    msg= MIMEMultipart('alternative')
    msg ['Subject']=asunto
    msg ['From'] = os.getenv("SMTP_USER")
    msg ['To']= para
    
    msg.attach(MIMEText(html,'html'))
    
    try:
        server= smtplib.SMTP(os.getenv("SMTP_SERVER"),os.getenv("SMTP_PORT"))
        server.login(os.getenv("SMTP_USER"),os.getenv("SMTP_PASSWORD"))
        server.sendmail(os.getenv("SMTP_USER"),para ,msg.as_string())
        server.quit()
    except SMTPResponseException as e:
        print("error al enviar el email")
        
        
        
def generar_pdf_venta(id,detalles):
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