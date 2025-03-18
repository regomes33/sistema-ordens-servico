from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Cliente, TipoServico, OrdemServico, ImagemOrdemServico
from .serializers import (
    ClienteSerializer, TipoServicoSerializer, 
    OrdemServicoSerializer, ImagemOrdemServicoSerializer, 
    ImagemUploadSerializer, UserSerializer
)
from django.contrib.auth.models import User
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from io import BytesIO

# Adicionar uma view para testar autenticação
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_auth(request):
    return Response({
        "message": "Autenticação bem-sucedida!",
        "user": request.user.username
    })

# Vista para depurar autorizações
@api_view(['GET'])
def debug_auth(request):
    """Vista para depurar autorização."""
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    token = request.GET.get('auth_token', '')
    return Response({
        'autenticado': request.user.is_authenticated,
        'usuario': request.user.username if request.user.is_authenticated else None,
        'auth_header': auth_header,
        'token_url': token,
        'auth_user_id': request.user.id if request.user.is_authenticated else None,
    })

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        # Adicionando log para depuração
        print(f"Listando clientes. Autenticado: {request.user.is_authenticated}, Usuário: {request.user.username if request.user.is_authenticated else None}")
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        # Adicionando log para depuração
        print(f"Criando cliente. Dados recebidos: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Erro ao criar cliente: {str(e)}")
            raise

class TipoServicoViewSet(viewsets.ModelViewSet):
    queryset = TipoServico.objects.all()
    serializer_class = TipoServicoSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrdemServicoViewSet(viewsets.ModelViewSet):
    queryset = OrdemServico.objects.all()
    serializer_class = OrdemServicoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = OrdemServico.objects.all()
        status = self.request.query_params.get('status')
        cliente = self.request.query_params.get('cliente')
        tipo_servico = self.request.query_params.get('tipo_servico')
        
        if status:
            queryset = queryset.filter(status=status)
        if cliente:
            queryset = queryset.filter(cliente__id=cliente)
        if tipo_servico:
            queryset = queryset.filter(tipo_servico__id=tipo_servico)
            
        return queryset
    
    @action(detail=True, methods=['post'], serializer_class=ImagemUploadSerializer)
    def upload_imagem(self, request, pk=None):
        ordem_servico = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            imagem = serializer.validated_data['imagem']
            descricao = serializer.validated_data.get('descricao', '')
            
            imagem_ordem_servico = ImagemOrdemServico.objects.create(
                ordem_servico=ordem_servico,
                imagem=imagem,
                descricao=descricao
            )
            
            return Response(
                ImagemOrdemServicoSerializer(imagem_ordem_servico).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    '''
    This viewset automatically provides `list` and `detail` actions.
    '''
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_detail(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_imagem(request, ordem_servico_id):
    try:
        imagens = request.FILES.getlist('imagens[]')
        
        imagens_salvas = []
        for imagem in imagens:
            imagem_servico = ImagemOrdemServico.objects.create(
                ordem_servico_id=ordem_servico_id,
                imagem=imagem
            )
            imagens_salvas.append(imagem_servico)
            
        serializer = ImagemUploadSerializer(imagens_salvas, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RelatorioOrdensViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        try:
            # Criar um buffer de memória para o PDF
            buffer = BytesIO()
            
            # Criar o PDF
            p = canvas.Canvas(buffer)
            p.drawString(100, 800, "Relatório de Ordens de Serviço")
            # Adicione mais conteúdo ao PDF aqui
            
            p.showPage()
            p.save()
            
            # Preparar a resposta com o PDF
            buffer.seek(0)
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="relatorio_ordens.pdf"'
            
            return response
            
        except Exception as e:
            return Response(
                {'erro': f'Erro ao gerar relatório: {str(e)}'},
                status=400
            )

    def retrieve(self, request, pk=None):
        # Se precisar recuperar um relatório específico
        pass