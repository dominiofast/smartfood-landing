# DomínioTech Backend API

API REST para o sistema de gestão de restaurantes DomínioTech.

## Arquitetura

### Níveis de Usuário

1. **Superadmin**: Gerencia todas as lojas cadastradas no sistema
   - Pode criar, editar e deletar lojas
   - Pode criar managers para as lojas
   - Tem acesso total ao sistema

2. **Manager**: Administra uma loja específica
   - Pode gerenciar sua própria loja
   - Pode criar funcionários (employees) para sua loja
   - Acesso limitado apenas à sua loja

3. **Employee**: Funcionário de uma loja
   - Acesso básico às funcionalidades operacionais

## Instalação

### Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB (v4.4 ou superior)
- NPM ou Yarn

### Configuração

1. Clone o repositório
2. Entre na pasta do backend: `cd backend`
3. Instale as dependências: `npm install`
4. Crie um arquivo `.env` baseado no `.env.example`
5. Configure as variáveis de ambiente:
   - `MONGODB_URI`: URL de conexão com MongoDB
   - `JWT_SECRET`: Chave secreta para JWT
   - `SUPERADMIN_EMAIL`: Email do superadmin inicial
   - `SUPERADMIN_PASSWORD`: Senha do superadmin inicial

### Executando o projeto

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm start
```

## Criando o Superadmin Inicial

Para criar o primeiro superadmin, faça uma requisição POST para:

```
POST /api/auth/create-superadmin
```

Isso criará um superadmin com as credenciais definidas no `.env`.

## Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrar novo usuário
- `GET /api/auth/me` - Obter usuário atual
- `PUT /api/auth/updateprofile` - Atualizar perfil
- `PUT /api/auth/updatepassword` - Atualizar senha
- `GET /api/auth/logout` - Logout

### Lojas (Stores)

- `GET /api/stores` - Listar lojas
- `POST /api/stores` - Criar nova loja (superadmin)
- `GET /api/stores/:id` - Obter loja específica
- `PUT /api/stores/:id` - Atualizar loja
- `DELETE /api/stores/:id` - Deletar loja (superadmin)
- `GET /api/stores/:id/stats` - Estatísticas da loja
- `GET /api/stores/dashboard` - Dashboard do superadmin

### Usuários

- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar novo usuário
- `GET /api/users/:id` - Obter usuário específico
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário (superadmin)
- `PUT /api/users/:id/toggle-status` - Ativar/Desativar usuário

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. 

Após o login, você receberá um token que deve ser incluído em todas as requisições subsequentes:

```
Authorization: Bearer <seu-token-aqui>
```

## Segurança

- Senhas são criptografadas com bcrypt
- Rate limiting implementado
- Helmet.js para headers de segurança
- CORS configurado
- Validação de entrada em todas as rotas

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/         # Configurações (banco de dados, etc)
│   ├── controllers/    # Lógica dos endpoints
│   ├── middleware/     # Middlewares (auth, error handling)
│   ├── models/         # Modelos do MongoDB
│   ├── routes/         # Definição das rotas
│   ├── services/       # Serviços auxiliares
│   ├── utils/          # Funções utilitárias
│   └── index.js        # Arquivo principal
├── package.json
└── README.md
``` 