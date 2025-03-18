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
    total_ordens = serializers.IntegerField()
    valor_total_servicos = serializers.DecimalField(max_digits=10, decimal_places=2)
    ultima_ordem = serializers.DateTimeField()
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'nome', 'email', 'telefone', 'total_ordens',
            'valor_total_servicos', 'ultima_ordem'
        ] 