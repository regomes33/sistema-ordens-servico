from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken import views as token_views
from servico import views, views_relatorio
from servico.views import test_auth, debug_auth, ClienteViewSet, TipoServicoViewSet, OrdemServicoViewSet, UserViewSet, RelatorioOrdensViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Criar uma view para verificar os endpoints disponíveis
@api_view(['GET'])
def api_root(request):
    return Response({
        'endpoints': {
            'clientes': '/api/clientes/',
            'tipos_servico': '/api/tipos-servico/',
            'ordens_servico': '/api/ordens-servico/',
            'usuarios': '/api/user/',
            'teste_auth': '/api/test-auth/',
            'token': '/api-token-auth/',
            'relatorios/ordens': '/api/relatorios/ordens/'
        }
    })

router = routers.DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'tipos-servico', views.TipoServicoViewSet)
router.register(r'ordens-servico', views.OrdemServicoViewSet)
router.register(r'user', views.UserViewSet)
router.register(r'relatorios/ordens', RelatorioOrdensViewSet, basename='relatorio-ordens')
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-token-auth/', token_views.obtain_auth_token, name='api_token_auth'),
    path('api/test-auth/', test_auth, name='test_auth'),
    path('api/endpoints/', api_root, name='api_root'),  # Endpoint para listar os endpoints disponíveis
    path('api/debug-auth/', debug_auth, name='debug_auth'),  # Endpoint para depurar autenticação
]

