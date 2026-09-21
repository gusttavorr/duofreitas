import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import path from 'path';

import { initDatabase } from './db.js';
import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Permitir carregar imagens da mesma origem
}));
app.use(cors({
  origin: 'http://localhost:5174', // URL do frontend no Vite (pode ser 5173, etc)
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Servir arquivos estáticos (imagens enviadas)
app.use('/imagens', express.static(path.join(process.cwd(), 'public/imagens')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Inicializar BD e servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}).catch(console.error);
