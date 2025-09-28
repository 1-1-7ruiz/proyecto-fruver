from django.urls import path
from .views import *


urlpatterns = [
    path('registro',class1.as_view()),
    path('login',classLogin.as_view()),
    path('recuperar',classRecuperar.as_view()),
    path('reset_password',classRecuperarPassword.as_view()),
    path("seguridad/activar/", ActivarCuenta.as_view()),
    path("change_password", ChangePasswordView.as_view(), name="change_password"),
]
