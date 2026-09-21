import { Router, Request, Response } from 'express';
import { getDb, saveDb } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// GET público - lista todos os produtos visíveis
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  // Se estiver autenticado, pode ver todos os produtos (inclusive ocultos)?
  // Vamos simplificar e retornar todos, pois o frontend filtra por 'visible'
  const result = db.exec('SELECT * FROM products ORDER BY sort_order ASC');
  
  const products = result.length > 0 ? result[0].values.map(row => {
    return {
      id: row[0],
      name: row[1],
      category: row[2],
      description: row[3],
      priceOld: row[4],
      priceCurrent: row[5],
      badge: row[6],
      visible: row[7] === 1,
      imageFront: row[8],
      imageBack: row[9],
      stock: {
        P: row[10],
        M: row[11],
        G: row[12],
        GG: row[13]
      },
      order: row[14]
    };
  }) : [];

  res.json(products);
});

// A partir daqui, protegido
router.use(requireAuth);

router.post('/', (req: Request, res: Response) => {
  const p = req.body;
  const db = getDb();
  db.run(`
    INSERT INTO products (id, name, category, description, price_old, price_current, badge, visible, image_front, image_back, stock_p, stock_m, stock_g, stock_gg, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    p.id, p.name, p.category, p.description, p.priceOld || null, p.priceCurrent, p.badge || null,
    p.visible ? 1 : 0, p.imageFront, p.imageBack,
    p.stock?.P || 0, p.stock?.M || 0, p.stock?.G || 0, p.stock?.GG || 0,
    p.order
  ]);
  saveDb();
  res.status(201).json({ message: 'Produto criado' });
});

router.put('/:id', (req: Request, res: Response) => {
  const p = req.body;
  const { id } = req.params;
  const db = getDb();
  db.run(`
    UPDATE products SET
      name = ?, category = ?, description = ?, price_old = ?, price_current = ?, badge = ?, visible = ?, image_front = ?, image_back = ?, stock_p = ?, stock_m = ?, stock_g = ?, stock_gg = ?, sort_order = ?
    WHERE id = ?
  `, [
    p.name, p.category, p.description, p.priceOld || null, p.priceCurrent, p.badge || null,
    p.visible ? 1 : 0, p.imageFront, p.imageBack,
    p.stock?.P || 0, p.stock?.M || 0, p.stock?.G || 0, p.stock?.GG || 0,
    p.order, id
  ]);
  saveDb();
  res.json({ message: 'Produto atualizado' });
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  db.run('DELETE FROM products WHERE id = ?', [id]);
  saveDb();
  res.json({ message: 'Produto deletado' });
});

export default router;
