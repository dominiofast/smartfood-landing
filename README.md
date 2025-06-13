# DomínioTech - Sistema de Gestão para Restaurantes com IA

Sistema SaaS completo para gestão de restaurantes com inteligência artificial integrada.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Netlify Functions + PostgreSQL (Neon)
- **IA**: OpenAI GPT-4 + Análise de dados em tempo real
- **Deploy**: Netlify

## 📋 Configuração do Banco de Dados

1. No painel do Netlify, vá em **Site settings** > **Environment variables**
2. Configure a variável `DATABASE_URL` com a string de conexão do Neon
3. Execute o script SQL em `database/schema.sql` no console do Neon

## 🔑 Credenciais de Acesso

### Superadmin (Acesso Total)
- **Email**: `admin@dominiotech.com`
- **Senha**: `DominioTech@2025`

### Como Acessar
1. Acesse a landing page
2. Clique no botão **"Entrar"** no menu superior
3. Use as credenciais acima para fazer login

## 🎯 Funcionalidades Principais

### Para Superadmin
- Gerenciar todas as lojas cadastradas
- Criar e gerenciar managers para cada loja
- Dashboard com visão geral do sistema
- Relatórios de todas as lojas

### Para Managers
- Gerenciar sua loja específica
- Criar funcionários
- Acessar assistente de IA
- Ver relatórios e análises da loja

### Assistente de IA
- Chat inteligente para dúvidas
- Análise automática de dados
- Geração de relatórios
- Insights e recomendações em tempo real
- Reconhecimento de voz
- Upload de documentos para análise

## 🔧 Variáveis de Ambiente Necessárias

```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=seu-jwt-secret-seguro
OPENAI_API_KEY=sua-chave-openai
NODE_ENV=production
```

## 📦 Deploy no Netlify

1. Faça fork deste repositório
2. Conecte ao Netlify
3. Configure as variáveis de ambiente
4. O deploy será feito automaticamente

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm run install:all

# Rodar localmente
npm run dev
```

## 📱 Estrutura do Projeto

```
dominiotech/
├── frontend/          # Aplicação React
├── netlify/          
│   └── functions/    # Serverless functions
├── database/         # Scripts SQL
├── scripts/          # Scripts utilitários
└── index.html        # Landing page
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Rate limiting nas APIs
- Validação de dados
- HTTPS obrigatório

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do sistema. 