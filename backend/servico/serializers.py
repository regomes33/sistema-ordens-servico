from rest_framework import serializers
from .models import Cliente, TipoServico, OrdemServico, ImagemOrdemServico
from django.contrib.auth.models import User

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class TipoServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoServico
        fields = '__all__'

class ImagemOrdemServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagemOrdemServico
        fields = ['id', 'imagem', 'descricao', 'data_upload']

class OrdemServicoSerializer(serializers.ModelSerializer):
    imagens = ImagemOrdemServicoSerializer(many=True, read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    tipo_servico_nome = serializers.CharField(source='tipo_servico.nome', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OrdemServico
        fields = [
            'id', 'cliente', 'cliente_nome', 'tipo_servico', 'tipo_servico_nome',
            'data_criacao', 'data_servico', 'tempo_garantia', 'descricao',
            'valor_mao_obra', 'valor_material', 'valor_total', 'status',
            'status_display', 'endereco', 'criado_por', 'imagens'
        ]
        read_only_fields = ['valor_total', 'criado_por']
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['criado_por'] = user
        return super().create(validated_data)

class ImagemUploadSerializer(serializers.Serializer):
    imagem = serializers.ImageField()
    descricao = serializers.CharField(required=False, allow_blank=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']