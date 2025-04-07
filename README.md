# Sistema de Ordens de Serviço

Sistema para gerenciamento de ordens de serviço desenvolvido com Vue.js e Django.

## Tecnologias Utilizadas

### Frontend
- Vue.js 3
- Vuetify 3
- Axios
- Vue Router

### Backend
- Django
- Django REST Framework
- SQLite (ou seu banco de dados)

## Funcionalidades

- Cadastro de Clientes
- Cadastro de Tipos de Serviço
- Gerenciamento de Ordens de Serviço
- Relatórios
  - Ordens de Serviço
  - Clientes
  - Estatísticas

## Instalação

### Backend (Django)

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

### Frontend (Vue.js)

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run serve

# Compilar para produção
npm run build
```

## Configuração

1. Configure o arquivo `.env` na raiz do projeto frontend:
```env
VUE_APP_API_URL=http://localhost:8000/api
```

2. Configure as variáveis de ambiente do Django em `backend/.env`:
```env
DEBUG=True
SECRET_KEY=sua_chave_secreta
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Uso

1. Acesse o sistema em `http://localhost:8000`
2. Faça login com suas credenciais
3. Navegue pelo menu para acessar as funcionalidades

## Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Contato

Seu Nome - [@seutwitter](https://twitter.com/seutwitter) - seu.email@exemplo.com

Link do projeto: [https://github.com/seu-usuario/sistema-ordens-servico](https://github.com/seu-usuario/sistema-ordens-servico) 
