from django.db import models
from django.contrib.auth.models import User

class Cliente(models.Model):
    nome = models.CharField(max_length=200)
    nome_responsavel = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    
    def __str__(self):
        return self.nome

class TipoServico(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    material_necessario = models.TextField(blank=True)
    def __str__(self):
        return self.nome
    # servicos = models.ManyToManyField(OrdemServico, related_name='tipos_servico', blank=True)
    
    class Meta:
        verbose_name = 'Tipo de Serviço'
        verbose_name_plural = 'Tipos de Serviços'


class OrdemServico(models.Model):
    STATUS_CHOICES = [
        ('ORCAMENTO', 'Orçamento'),      # <- MUDOU
        ('APROVADO', 'Aprovado'),       # <- MUDOU
        ('PENDENTE', 'Pendente'),       # <- MUDOU
        ('EM_ANDAMENTO', 'Em Andamento'), # <- MUDOU (valor e texto)
        ('CONCLUIDO', 'Concluído'),     # <- MUDOU (valor e texto)
        ('CANCELADO', 'Cancelado'),     # <- MUDOU
    ]
    
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    tipo_servico = models.ManyToManyField(TipoServico)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_servico = models.DateField()
    tempo_garantia = models.CharField(max_length=100)
    descricao = models.TextField()
    valor_mao_obra = models.DecimalField(max_digits=10, decimal_places=2)
    valor_material = models.DecimalField(max_digits=10, decimal_places=2)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    endereco = models.TextField()
    criado_por = models.ForeignKey(User, on_delete=models.CASCADE)
    


    def __str__(self):
        return f"OS #{self.id} - {self.cliente.nome}"
    
    def save(self, *args, **kwargs):
        self.valor_total = self.valor_mao_obra + self.valor_material
        super().save(*args, **kwargs)

class ImagemOrdemServico(models.Model):
    ordem_servico = models.ForeignKey(
        OrdemServico, 
        on_delete=models.CASCADE,
        related_name='imagens'
    )
    imagem = models.ImageField(
        upload_to='imagens_servico/%Y/%m/%d/',
        blank=True,
        null=True
    )
    descricao = models.CharField(max_length=255, blank=True)
    data_upload = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Imagem da Ordem de Serviço'
        verbose_name_plural = 'Imagens das Ordens de Serviço'
        ordering = ['-data_upload']

    def __str__(self):
        return f"Imagem {self.id} - OS {self.ordem_servico.id}"