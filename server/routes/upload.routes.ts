import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../auth.js';
import fs from 'fs';

const router = Router();

// Garantir que a pasta public/imagens existe
const uploadDir = path.join(process.cwd(), 'public/imagens');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Usar o nome original ou gerar um nome seguro
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// A rota de upload deve ser protegida
router.use(requireAuth);

router.post('/', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'Nenhuma imagem enviada' });
    return;
  }
  
  // Retorna a URL da imagem
  res.json({ url: `/imagens/${req.file.filename}` });
});

export default router;
