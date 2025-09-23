import jwt
from django.conf import settings#para usar la clave secreta del usuario
from django.http import JsonResponse
from functools import wraps  #conserva el nombre y la documentación 
                            #original de la función decorada.
from jwt.exceptions import ExpiredSignatureError,InvalidTokenError
from http import HTTPStatus
import time


def logueado(): #devuelve una funcion interna que hace todo el trabajo
    #funcion interna que envuelve la lista
    def metodo(func):
        @wraps(func)#este decorador ayuda a que la funcion decorada mantenga su nombre original
        
        def _decorator(*args, **kwargs):
            # args[0] = self (la vista)
            #args[1]= request
            request=args[0]
            
            #acepta tokens enviados desde clientes que usan META
            token_header=request.headers.get('Authorization') or request.META.get("HTTP_AUTHORIZATION")
            
            if not token_header:
                return JsonResponse ({"Estado":"Error",
                                    "Mensaje":"Sin autorizacion"},
                                    status=HTTPStatus.UNAUTHORIZED)
            
            header=token_header.split(" ")
            if len(header)!= 2 or header[0] != "bearer":
                return JsonResponse ({"Estado":"Error",
                                    "Mensaje":"Formato invalido de token"},
                                    status=HTTPStatus.UNAUTHORIZED)
                
            token=header[1]
            
            try:
                datos_token=jwt.decode(token,settings.SECRET_KEY,algorithms=['HS512'])
            except Exception as e:
                print("Error al codificar el token",str(e))
                return JsonResponse ({"Estado":"Error",
                                    "Mensaje":"token invalido"},
                                    status=HTTPStatus.UNAUTHORIZED)
            
            if int(datos_token.get("exp",0))> int(time.time()):
                return func(*args, **kwargs)
            else:
                return JsonResponse ({"Estado":"Error",
                                    "Mensaje":"token expirado"},
                                    status=HTTPStatus.UNAUTHORIZED)
        return _decorator
    return metodo