const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Carregar variáveis de ambiente. Em produção (Netlify), elas são injetadas diretamente.
// Em desenvolvimento, carrega do arquivo .env na raiz do projeto.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

// Conectar ao banco de dados
connectDB();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Helmet para segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100 // limite de requisições
});
app.use('/api/', limiter);

// Rate limiting mais restrito para autenticação
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // limite de 5 tentativas
  skipSuccessfulRequests: true
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Montar rotas
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/users', userRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DomínioTech API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error(err);

  // Erro de CastError do Mongoose
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = { message, statusCode: 404 };
  }

  // Erro de duplicação do Mongoose
  if (err.code === 11000) {
    const message = 'Valor duplicado inserido';
    error = { message, statusCode: 400 };
  }

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro no servidor'
  });
});

const PORT = process.env.PORT || 5000;

// Em um ambiente serverless, o app.listen não é necessário,
// pois o provedor (Netlify) gerencia o ciclo de vida do servidor.
// Só executamos o listen em ambiente de desenvolvimento.
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
  });

  // Lidar com promise rejections não tratadas
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Erro no servidor: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app; 