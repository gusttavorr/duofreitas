import { Router, Request, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// GET público - configurações
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const result = db.exec('SELECT * FROM site_settings WHERE id = 1');
  
  if (result.length > 0 && result[0].values.length > 0) {
    const row = result[0].values[0];
    res.json({
      heroSlides: JSON.parse(row[1] as string),
      themeColorOffwhite: row[2],
      themeColorWhite: row[3],
      themeColorBlack: row[4]
    });
  } else {
    // Retorna defaults caso falhe
    res.json({
      heroSlides: ['/imagens/hero-1.jpg'],
      themeColorOffwhite: '#fce8eb',
      themeColorWhite: '#fff5f7',
      themeColorBlack: '#3a2e30'
    });
  }
});

// Protegido
router.use(requireAuth);

router.put('/', (req: Request, res: Response) => {
  const { heroSlides, themeColorOffwhite, themeColorWhite, themeColorBlack } = req.body;
  const db = getDb();
  
  db.run(`
    UPDATE site_settings SET 
      hero_slides = ?, 
      theme_color_offwhite = ?, 
      theme_color_white = ?, 
      theme_color_black = ?
    WHERE id = 1
  `, [
    JSON.stringify(heroSlides || []),
    themeColorOffwhite || '#fce8eb',
    themeColorWhite || '#fff5f7',
    themeColorBlack || '#3a2e30'
  ]);
  
  saveDb();
  res.json({ message: 'Configurações atualizadas' });
});

export default router;
