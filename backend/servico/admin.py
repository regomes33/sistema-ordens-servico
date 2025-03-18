from django.contrib import admin
from .models import Cliente,OrdemServico,TipoServico,ImagemOrdemServico
# Register your models here.

admin.site.register(Cliente)
admin.site.register(OrdemServico)
admin.site.register(TipoServico)
admin.site.register(ImagemOrdemServico)


