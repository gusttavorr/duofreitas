import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // max 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente mais tarde.'
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email e senha são obrigatórios' });
    return;
  }

  const db = getDb();
  const stmt = db.prepare('SELECT email, password_hash FROM admin_users WHERE email = ?');
  stmt.bind([email]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    const isValid = await bcrypt.compare(password, row.password_hash as string);
    if (isValid) {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '8h' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000 // 8h
      });
      res.json({ message: 'Login bem-sucedido' });
      stmt.free();
      return;
    }
  }
  stmt.free();
  res.status(401).json({ message: 'Credenciais inválidas' });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout bem-sucedido' });
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
