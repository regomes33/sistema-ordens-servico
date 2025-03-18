from django.db.models import Count, Sum, Max
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from datetime import datetime
from django.db.models import Q
from .models import OrdemServico, Cliente
from .serializers_relatorio import RelatorioOrdemServicoSerializer, RelatorioClienteSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_ordens(request):
    # Parâmetros da requisição
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')
    status = request.GET.get('status')
    cliente_id = request.GET.get('cliente')
    tipo_servico_id = request.GET.get('tipo_servico')

    # Query base
    queryset = OrdemServico.objects.all()

    # Aplicar filtros
    if data_inicio:
        queryset = queryset.filter(data_criacao__gte=data_inicio)
    if data_fim:
        queryset = queryset.filter(data_criacao__lte=data_fim)
    if status:
        queryset = queryset.filter(status=status)
    if cliente_id:
        queryset = queryset.filter(cliente_id=cliente_id)
    if tipo_servico_id:
        queryset = queryset.filter(tipo_servico__id=tipo_servico_id)

    # Serializar dados
    serializer = RelatorioOrdemServicoSerializer(queryset, many=True)
    
    # Calcular resumo
    resumo = {
        'total_ordens': queryset.count(),
        'valor_total': queryset.aggregate(Sum('valor_total'))['valor_total__sum'] or 0,
        'media_valor': queryset.aggregate(Avg('valor_total'))['valor_total__avg'] or 0,
        'status_count': dict(queryset.values_list('status').annotate(total=Count('id')))
    }

    return Response({
        'ordens': serializer.data,
        'resumo': resumo
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_clientes(request):
    # Parâmetros da requisição
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')

    # Query base para clientes com estatísticas
    clientes = Cliente.objects.annotate(
        total_ordens=Count('ordemservico'),
        valor_total_servicos=Sum('ordemservico__valor_total'),
        ultima_ordem=Max('ordemservico__data_criacao')
    )

    # Aplicar filtros de data nas ordens de serviço
    if data_inicio or data_fim:
        ordem_filter = Q()
        if data_inicio:
            ordem_filter &= Q(ordemservico__data_criacao__gte=data_inicio)
        if data_fim:
            ordem_filter &= Q(ordemservico__data_criacao__lte=data_fim)
        clientes = clientes.filter(ordem_filter)

    # Serializar dados
    serializer = RelatorioClienteSerializer(clientes, many=True)

    # Calcular resumo
    resumo = {
        'total_clientes': clientes.count(),
        'media_servicos_por_cliente': clientes.aggregate(
            avg_servicos=Avg('total_ordens')
        )['avg_servicos'] or 0,
        'total_faturamento': clientes.aggregate(
            total=Sum('valor_total_servicos')
        )['total'] or 0
    }

    return Response({
        'clientes': serializer.data,
        'resumo': resumo
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exportar_pdf(request, tipo):
    # Criar buffer para o PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Configurar título
    p.setFont("Helvetica-Bold", 16)
    p.drawString(30, 750, f"Relatório de {'Ordens de Serviço' if tipo == 'ordens' else 'Clientes'}")
    p.setFont("Helvetica", 12)
    
    # Adicionar data do relatório
    data_atual = datetime.now().strftime("%d/%m/%Y %H:%M")
    p.drawString(30, 730, f"Gerado em: {data_atual}")
    
    if tipo == 'ordens':
        # Obter dados do relatório de ordens
        dados = relatorio_ordens(request)._data
        
        # Adicionar dados ao PDF
        y = 700
        for ordem in dados['ordens']:
            if y < 50:  # Nova página se necessário
                p.showPage()
                y = 750
            p.drawString(30, y, f"OS #{ordem['id']} - {ordem['cliente_nome']}")
            p.drawString(30, y-15, f"Status: {ordem['status_display']}")
            p.drawString(30, y-30, f"Valor: R$ {ordem['valor_total']}")
            y -= 50
            
    elif tipo == 'clientes':
        # Obter dados do relatório de clientes
        dados = relatorio_clientes(request)._data
        
        # Adicionar dados ao PDF
        y = 700
        for cliente in dados['clientes']:
            if y < 50:  # Nova página se necessário
                p.showPage()
                y = 750
            p.drawString(30, y, f"Cliente: {cliente['nome']}")
            p.drawString(30, y-15, f"Total Ordens: {cliente['total_ordens']}")
            p.drawString(30, y-30, f"Valor Total: R$ {cliente['valor_total_servicos']}")
            y -= 50
    
    # Finalizar PDF
    p.showPage()
    p.save()
    
    # Preparar resposta
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename=relatorio_{tipo}_{datetime.now().strftime("%Y%m%d")}.pdf'
    
    return response 