from django.urls import path
from . import views

urlpatterns = [
    # ... suas outras urls ...
    path('upload-imagens/', views.upload_imagens, name='upload-imagens'),
] 