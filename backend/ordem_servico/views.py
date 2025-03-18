from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import OrdemServico, ImagemOrdemServico
from .serializers import ImagemOrdemServicoSerializer

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_imagens(request):
    try:
        ordem_servico_id = request.data.get('ordem_servico_id')
        ordem_servico = OrdemServico.objects.get(id=ordem_servico_id)
        
        imagens = request.FILES.getlist('imagens[]')
        imagens_salvas = []
        
        for imagem in imagens:
            imagem_os = ImagemOrdemServico.objects.create(
                ordem_servico=ordem_servico,
                imagem=imagem
            )
            imagens_salvas.append(imagem_os)
        
        serializer = ImagemOrdemServicoSerializer(imagens_salvas, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except OrdemServico.DoesNotExist:
        return Response(
            {'error': 'Ordem de serviço não encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        ) 