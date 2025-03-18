from rest_framework import serializers
from .models import OrdemServico, ImagemOrdemServico

class ImagemOrdemServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagemOrdemServico
        fields = ['id', 'imagem', 'descricao', 'data_upload']

class OrdemServicoSerializer(serializers.ModelSerializer):
    imagens = ImagemOrdemServicoSerializer(many=True, read_only=True)
    
    class Meta:
        model = OrdemServico
        fields = ['id', ... 'imagens'] # adicione 'imagens' aos seus campos existentes 