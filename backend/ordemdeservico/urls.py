from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework.authtoken import views as token_views
# Importe ambas as views e views_relatorio da sua app servico
from servico import views, views_relatorio
# Importe explicitamente as views usadas diretamente aqui (ou use views.test_auth etc.)
from servico.views import test_auth, debug_auth
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Criar uma view para verificar os endpoints disponíveis (mantido)
@api_view(['GET'])
def api_root(request):
     # Atualize esta lista conforme necessário
    return Response({
        'endpoints': {
            'clientes': '/api/clientes/',
            'tipos_servico': '/api/tipos-servico/',
            'ordens_servico': '/api/ordens-servico/',
            'usuarios': '/api/user/',
            'teste_auth': '/api/test-auth/',
            'token': '/api-token-auth/',
            'relatorios_ordens': '/api/relatorios/ordens/', # Nome corrigido
            'relatorios_clientes': '/api/relatorios/clientes/',
            'relatorios_pdf': '/api/relatorios/{tipo}/pdf/',
        }
    })

# --- Router para as views baseadas em ViewSet ---
router = routers.DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'tipos-servico', views.TipoServicoViewSet)
router.register(r'ordens-servico', views.OrdemServicoViewSet)
router.register(r'user', views.UserViewSet)
# REMOVIDO: router.register(r'relatorios/ordens', RelatorioOrdensViewSet, basename='relatorio-ordens')

# --- Lista principal de urlpatterns ---
urlpatterns = [
    path('admin/', admin.site.urls),

    # Inclui as URLs do router (clientes, tipos, ordens normais, user) sob /api/
    path('api/', include(router.urls)),

    # Adiciona as URLs específicas de RELATÓRIO diretamente aqui, sob /api/
    path('api/relatorios/ordens/', views_relatorio.relatorio_ordens, name='api-relatorio-ordens'),
    path('api/relatorios/clientes/', views_relatorio.relatorio_clientes, name='api-relatorio-clientes'),
    path('api/relatorios/<str:tipo>/pdf/', views_relatorio.exportar_pdf, name='api-exportar-pdf'),

    # Outras URLs da API
    path('api/api-token-auth/', token_views.obtain_auth_token, name='api_token_auth'),
    path('api/test-auth/', test_auth, name='test_auth'),
    path('api/endpoints/', api_root, name='api_root'),
    path('api/debug-auth/', debug_auth, name='debug_auth'),

    # Se você tiver upload de imagem fora do ViewSet, adicione aqui também
    # path('api/ordem-servico/<int:ordem_servico_id>/upload-imagem/', views.upload_imagem, name='upload-imagem'),
]

# Adicionar configuração de mídia se necessário (geralmente no final)
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)