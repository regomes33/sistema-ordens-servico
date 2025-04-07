from rest_framework import serializers
from .models import OrdemServico, Cliente

class RelatorioOrdemServicoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='cliente.nome')
    tipo_servico_nome = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display')
    
    class Meta:
        model = OrdemServico
        fields = [
            'id', 'cliente_nome', 'tipo_servico_nome', 'data_criacao',
            'data_servico', 'valor_total', 'status_display'
        ]
    
    def get_tipo_servico_nome(self, obj):
        return ", ".join([tipo.nome for tipo in obj.tipo_servico.all()])

class RelatorioClienteSerializer(serializers.ModelSerializer):
    # Campos anotados - use os nomes definidos na view
    total_ordens = serializers.IntegerField(source='total_ordens_periodo', read_only=True)
    valor_total_servicos = serializers.DecimalField(source='valor_total_periodo', max_digits=10, decimal_places=2, read_only=True)
    ultima_ordem = serializers.DateTimeField(source='ultima_ordem_periodo', read_only=True, format="%Y-%m-%dT%H:%M:%S") # Ou outro formato

    class Meta:
        model = Cliente
        fields = [
            'id',
            'nome',
            'email',
            'telefone',
            'total_ordens', # Agora reflete o período
            'valor_total_servicos', # Agora reflete o período
            'ultima_ordem', # Agora reflete o período
            # Inclua outros campos do Cliente se necessário
        ]