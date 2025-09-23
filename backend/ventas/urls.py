from .views import *
from django.urls import path

urlpatterns = [
    path('venta',classVenta.as_view(),name="venta"),
    path('venta/<int:id>',classventa2.as_view(),name="venta_detalle"),
    path('detalle/<int:id>',classPDF.as_view()),
    path('reporteVenta',classReporteVentas.as_view()),
    path('contar',classContar.as_view()),
]
