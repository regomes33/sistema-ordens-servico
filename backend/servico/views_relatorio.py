# views_relatorio.py
from django.db.models import Count, Sum, Max, Avg, Q ,Value, DecimalField, Case, When, F
from django.db.models.functions import Coalesce
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpRequest, HttpResponse # Importar HttpRequest
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from io import BytesIO
from decimal import Decimal
from datetime import datetime, timedelta # Importar timedelta aqui
from .models import OrdemServico, Cliente
from .serializers_relatorio import RelatorioOrdemServicoSerializer, RelatorioClienteSerializer
import logging
from django.utils import timezone


logger = logging.getLogger(__name__)

# --- FUNÇÃO AUXILIAR PARA FILTRAR ORDENS ---
def _filtrar_ordens_servico(params):
    """
    Aplica filtros ao queryset base de OrdemServico.
    params: Um dicionário como request.GET ou similar.
    """
    data_inicio_str = params.get('data_inicio')
    data_fim_str = params.get('data_fim')
    status_str = params.get('status')
    cliente_ids_str = params.get('cliente')
    tipo_servico_ids_str = params.get('tipo_servico')

    logger.debug(f"[_filtrar_ordens_servico] Filtros recebidos: {params}")

    # Começa com o queryset base
    queryset = OrdemServico.objects.select_related('cliente').prefetch_related('tipo_servico').all()

    # Filtro de Data
    if data_inicio_str:
        try:
            dt_inicio_naive = datetime.strptime(data_inicio_str, '%Y-%m-%d')
            dt_inicio_aware = timezone.make_aware(dt_inicio_naive, timezone.get_default_timezone())
            queryset = queryset.filter(data_criacao__gte=dt_inicio_aware)
        except ValueError:
            logger.warning(f"Formato inválido para data_inicio: {data_inicio_str}")
    if data_fim_str:
        try:
            dt_fim_naive = datetime.strptime(data_fim_str, '%Y-%m-%d')
            dt_fim_inclusive_naive = dt_fim_naive + timedelta(days=1)
            dt_fim_inclusive_aware = timezone.make_aware(dt_fim_inclusive_naive, timezone.get_default_timezone())
            queryset = queryset.filter(data_criacao__lt=dt_fim_inclusive_aware)
        except ValueError:
            logger.warning(f"Formato inválido para data_fim: {data_fim_str}")

    # Filtro de Status
    if status_str:
        status_list = [s.strip() for s in status_str.split(',') if s.strip()]
        if status_list:
            queryset = queryset.filter(status__in=status_list)

    # Filtro de Cliente
    if cliente_ids_str:
        cliente_ids = [int(cid.strip()) for cid in cliente_ids_str.split(',') if cid.strip().isdigit()]
        if cliente_ids:
            queryset = queryset.filter(cliente_id__in=cliente_ids)

    # Filtro de Tipo de Serviço
    if tipo_servico_ids_str:
        tipo_servico_ids = [int(tid.strip()) for tid in tipo_servico_ids_str.split(',') if tid.strip().isdigit()]
        if tipo_servico_ids:
            # Se uma OS pode ter múltiplos tipos, 'distinct()' pode ser necessário
            # Se for ForeignKey (um tipo por OS), 'distinct()' não é necessário aqui.
            queryset = queryset.filter(tipo_servico__id__in=tipo_servico_ids) # .distinct() ?

    # Log e Retorno APENAS do queryset
    logger.debug(f"[_filtrar_ordens_servico] Queryset filtrado count: {queryset.count()}")
    return queryset
# --- FIM DA FUNÇÃO AUXILIAR ---



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_ordens(request):
  
    logger.error("!!!!!!!! EXECUTANDO relatorio_ordens (JSON) !!!!!!!!")

    # 1. Chama a função auxiliar para obter o queryset filtrado
    queryset_filtrado = _filtrar_ordens_servico(request.GET)

    # 2. Serializa o queryset AQUI
    serializer_data=[] 
    try:
        serializer = RelatorioOrdemServicoSerializer(queryset_filtrado, many=True)
        serializer_data = serializer.data
    except Exception as e:
        logger.exception("ERRO DURANTE A SERIALIZAÇÃO (Ordens JSON)!")
        return Response({"error": "Erro interno ao serializar dados de ordens"}, status=500)

    # 3. Calcula o resumo AQUI
    resumo = {} # Inicializa resumo
    try:
        resumo_aggr = queryset_filtrado.aggregate(
            total_ordens_val=Count('id'),
            valor_total_sum=Sum('valor_total')
        )
        total_ordens = resumo_aggr.get('total_ordens_val', 0) or 0
        # Converta Decimal para float se necessário para o JSON ou deixe Decimal
        valor_total_decimal = resumo_aggr.get('valor_total_sum', Decimal('0.00')) or Decimal('0.00')
        media_valor_decimal = (valor_total_decimal / total_ordens) if total_ordens > 0 else Decimal('0.00')
        status_counts = dict(queryset_filtrado.values_list('status').annotate(total=Count('id')))
        resumo = {
            'total_ordens': total_ordens,
            'valor_total': float(valor_total_decimal), # Converte para float para JSON
            'media_valor': float(media_valor_decimal), # Converte para float para JSON
            'status_count': status_counts
        }
    except Exception as e:
        logger.exception("ERRO DURANTE A AGREGAÇÃO (Ordens JSON)!")
        resumo = {"error": "Falha ao calcular resumo de ordens"}

    # 4. Monta o payload da resposta AQUI
    response_payload = {
        'ordens': serializer_data,
        'resumo': resumo,
        'total': queryset_filtrado.count() # Adiciona o total
    }
    logger.debug(f"!!!!!!!! FINAL PAYLOAD TO BE SENT by relatorio_ordens: {response_payload}")
    return Response(response_payload)

    


# Função exportar_pdf - MODIFICADA
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exportar_pdf(request, tipo):
    logger.error(f"!!!!!!!! EXECUTANDO exportar_pdf para tipo '{tipo}' !!!!!!!!")
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    # ... (configuração inicial do PDF: título, data) ...
    p.setFont("Helvetica-Bold", 14)
    title_y = height - 2*cm
    p.drawString(2*cm, title_y, f"Relatório de {'Ordens de Serviço' if tipo == 'ordens' else 'Clientes'}")
    p.setFont("Helvetica", 10)
    data_atual = datetime.now().strftime("%d/%m/%Y %H:%M")
    p.drawString(width - 5*cm, title_y, f"Gerado em: {data_atual}")

    y_position = title_y - 1.5*cm
    line_height = 0.6*cm
    margin_bottom = 2*cm

    try:
        if tipo == 'ordens':
            # --- MODIFICAÇÃO AQUI ---
            # 1. Chama a função auxiliar para obter o queryset filtrado
            # Passa request.GET (parâmetros da URL)
            queryset_ordens = _filtrar_ordens_servico(request.GET)

            # 2. Serializa os dados (necessário para nomes formatados como cliente_nome)
            # OU acessa os campos diretamente do queryset se não precisar dos nomes formatados
            # Vamos serializar para manter a consistência com o JSON
            serializer = RelatorioOrdemServicoSerializer(queryset_ordens, many=True)
            dados_serializados = serializer.data

            # 3. Calcula o resumo (opcionalmente refazer aqui ou passar do JSON)
            # Vamos recalcular para simplicidade
            resumo_aggr = queryset_ordens.aggregate(total_ordens_val=Count('id'), valor_total_sum=Sum('valor_total'))
            total_ordens = resumo_aggr.get('total_ordens_val', 0) or 0
            valor_total = resumo_aggr.get('valor_total_sum', 0) or 0
            media_valor = (valor_total / total_ordens) if total_ordens > 0 else 0
            resumo = {'total_ordens': total_ordens, 'valor_total': valor_total, 'media_valor': media_valor}
            # --- FIM DA MODIFICAÇÃO ---

            # Adicionar dados ao PDF usando dados_serializados
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2*cm, y_position, "ID")
            # ... (outros cabeçalhos) ...
            p.drawString(16*cm, y_position, "Valor (R$)")
            y_position -= line_height
            p.setFont("Helvetica", 9)

            for ordem in dados_serializados: # Itera sobre os dados serializados
                 if y_position < margin_bottom: p.showPage(); # ... (recria cabeçalho) ...
                 # ... (formatação de data e valor) ...
                 data_fmt = datetime.strptime(ordem['data_criacao'].split('T')[0], '%Y-%m-%d').strftime('%d/%m/%Y') if ordem.get('data_criacao') else 'N/A'
                 valor_fmt = f"{float(ordem.get('valor_total', 0)):.2f}".replace('.', ',') # Converte Decimal para float para formatar

                 p.drawString(2*cm, y_position, str(ordem.get('id', '')))
                 p.drawString(4*cm, y_position, str(ordem.get('cliente_nome', ''))) # Usa dado serializado
                 # ... (outros campos) ...
                 p.drawString(16*cm, y_position, valor_fmt)
                 y_position -= line_height

            # Adicionar resumo ao PDF
            # ... (código do resumo no PDF) ...


        elif tipo == 'clientes':
             # TODO: Refatorar a lógica de filtro de clientes para uma função auxiliar também
             # Por enquanto, a lógica original é mantida aqui
            data_inicio_str = request.GET.get('data_inicio')
            data_fim_str = request.GET.get('data_fim')
            clientes_annotated = Cliente.objects.annotate(...)
            ordem_filter = Q()
            if data_inicio_str: ...
            if data_fim_str: ...
            if ordem_filter: clientes_filtrados = clientes_annotated.filter(ordem_filter).distinct()
            else: clientes_filtrados = clientes_annotated
            serializer = RelatorioClienteSerializer(clientes_filtrados, many=True)
            dados_serializados = serializer.data
            # ... (código para gerar PDF de clientes usando dados_serializados) ...


    except Exception as e:
        logger.error(f"Erro ao gerar PDF para tipo '{tipo}': {e}", exc_info=True)
        # ... (código de erro no PDF) ...
        return HttpResponse(buffer, content_type='application/pdf', status=500)

    p.save()
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    disposition = request.GET.get('disposition', 'attachment')
    response['Content-Disposition'] = f'{disposition}; filename="relatorio_{tipo}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_clientes(request):
    logger.error("!!!!!!!! EXECUTANDO relatorio_clientes (JSON) !!!!!!!!")

    data_inicio_str = request.GET.get('data_inicio')
    data_fim_str = request.GET.get('data_fim')
    # Adicione outros filtros se necessário
    cliente_ids_str = request.GET.get('cliente') # Pegar filtro de cliente se houver

    logger.debug(f"[relatorio_clientes] Filtros recebidos: {request.GET}")

    # Filtro base para clientes (se houver ID específico)
    cliente_filter = Q()
    if cliente_ids_str:
        cliente_ids = [int(cid.strip()) for cid in cliente_ids_str.split(',') if cid.strip().isdigit()]
        if cliente_ids:
            cliente_filter = Q(id__in=cliente_ids)

    # Filtro de data para ser usado nas agregações condicionais
    ordem_periodo_filter = Q()
    data_inicio = None
    data_fim_inclusive = None # Data final + 1 dia para <
    
    if data_inicio_str:
        try:
      
            dt_inicio_naive = datetime.strptime(data_inicio_str, '%Y-%m-%d')
            dt_inicio_aware = timezone.make_aware(dt_inicio_naive, timezone.get_default_timezone())
            ordem_periodo_filter &= Q(ordemservico__data_criacao__gte=dt_inicio_aware)
        except ValueError:
            logger.warning(f"Formato inválido para data_inicio: {data_inicio_str}")
    
    if data_fim_str:
        try:
            data_fim_obj = datetime.strptime(data_fim_str, '%Y-%m-%d').date()
            data_fim_inclusive = data_fim_obj + timedelta(days=1)
            ordem_periodo_filter &= Q(ordemservico__data_criacao__lt=data_fim_inclusive)
        except ValueError:
            logger.warning(f"Formato inválido para data_fim: {data_fim_str}")

    # --- NOVA LÓGICA DE ANOTAÇÃO ---
    clientes_base = Cliente.objects.filter(cliente_filter) # Aplica filtro de ID de cliente primeiro

    clientes_annotated = clientes_base.annotate(
        # Anotações específicas do período
        total_ordens_periodo=Count(
            'ordemservico',
            filter=ordem_periodo_filter # Aplica filtro de data DENTRO do Count
        ),
        valor_total_periodo=Coalesce( # Usa Coalesce para garantir 0 se não houver ordens
            Sum(
                'ordemservico__valor_total',
                filter=ordem_periodo_filter, # Aplica filtro de data DENTRO do Sum
                output_field=DecimalField() # Especifica o tipo de campo
            ),
            Value(0), # Valor padrão se a soma for None
            output_field=DecimalField()
        ),
        # Você pode manter a última ordem geral ou calcular a do período
        ultima_ordem_periodo=Max(
             'ordemservico__data_criacao',
             filter=ordem_periodo_filter # Aplica filtro de data DENTRO do Max
         ),
        # Anotações gerais (se ainda precisar delas para algo) - Opcional
        # total_ordens_geral=Count('ordemservico'),
        # valor_total_geral=Sum('ordemservico__valor_total'),
        # ultima_ordem_geral=Max('ordemservico__data_criacao')
    ).order_by('nome') # Ordena como antes

    # --- FIM DA NOVA LÓGICA DE ANOTAÇÃO ---


    # Filtra clientes que tiveram atividade NO PERÍODO (total_ordens_periodo > 0)
    # Isso garante que só listamos clientes relevantes para o período.
    # Se quiser listar todos os clientes filtrados por ID mesmo sem ordens no período, remova esta linha.
    #clientes_final = clientes_annotated.filter(total_ordens_periodo__gt=0)
    clientes_final = clientes_annotated
    #logger.debug(f"[relatorio_clientes] Clientes finais count: {clientes_final.count()}")

    try:
        # IMPORTANTE: Certifique-se que seu RelatorioClienteSerializer
        #             agora use os campos '_periodo' (ex: total_ordens_periodo)
        serializer = RelatorioClienteSerializer(clientes_final, many=True)
        serializer_data = serializer.data
    except Exception as e:
        logger.exception("ERRO DURANTE A SERIALIZAÇÃO (Clientes)!")
        return Response({"error": "Erro interno ao serializar dados de clientes"}, status=500)

    # --- NOVA LÓGICA DE RESUMO ---
    # Calcula o resumo com base nos clientes *e* nas anotações do período
    resumo = {}
    if clientes_final.exists():
         try:
            # Agrega os valores JÁ ANOTADOS (e filtrados pelo período)
            resumo_aggr = clientes_final.aggregate(
                # avg_ordens_periodo=Avg('total_ordens_periodo'), # Média de ordens no período por cliente ativo
                total_faturamento_periodo=Sum('valor_total_periodo') # Soma do valor no período dos clientes ativos
            )
            total_clientes_ativos = clientes_final.count()
            total_faturamento = resumo_aggr.get('total_faturamento_periodo', 0) or 0
            ticket_medio = (total_faturamento / total_clientes_ativos) if total_clientes_ativos > 0 else 0

            resumo = {
                'total_clientes': total_clientes_ativos, # Renomear para total_clientes_ativos?
                # 'media_ordens_periodo': resumo_aggr.get('avg_ordens_periodo', 0) or 0,
                'total_faturamento': total_faturamento, # Já é do período
                # Adicionar ticket médio ao resumo backend
                'ticket_medio': ticket_medio
            }
         except Exception as e:
              logger.exception("ERRO DURANTE A AGREGAÇÃO (Resumo Clientes)!")
              resumo = {"error": "Falha ao calcular resumo de clientes"}
    else:
        # Estado quando nenhum cliente teve atividade no período
        resumo = { 'total_clientes': 0, 'total_faturamento': 0, 'ticket_medio': 0 }

    # --- FIM DA NOVA LÓGICA DE RESUMO ---

    logger.debug(f"[relatorio_clientes] Resumo calculado: {resumo}")

    response_payload = {
        # IMPORTANTE: Garanta que o frontend espera 'clientes' ou ajuste aqui
        'data': serializer_data, # Muitas APIs usam 'data' como chave principal da lista
        'resumo': resumo,
        'total': clientes_final.count() # Adiciona contagem total para paginação no frontend
    }
    logger.debug(f"[relatorio_clientes] Payload final da resposta: {response_payload}")
    return Response(response_payload)

# --- FIM DA NOVA FUNÇÃO ---