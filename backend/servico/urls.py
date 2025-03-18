from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static
from . import views, views_relatorio
from servico import views as v
router = routers.DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'tipos-servico', views.TipoServicoViewSet)
router.register(r'ordens-servico', views.OrdemServicoViewSet)
router.register(r'user', v.UserViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('ordem-servico/<int:ordem_servico_id>/upload-imagem/', views.upload_imagem, name='upload-imagem'),
    
    # Novas rotas para relatórios
    path('relatorios/ordens/', views_relatorio.relatorio_ordens, name='relatorio-ordens'),
    path('relatorios/clientes/', views_relatorio.relatorio_clientes, name='relatorio-clientes'),
    path('relatorios/<str:tipo>/pdf/', views_relatorio.exportar_pdf, name='exportar-pdf'),
]

# Configuração para servir arquivos de mídia
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)