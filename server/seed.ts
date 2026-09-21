import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { initDatabase, getDb, saveDb } from './db.js';

/**
 * Script de seed — cria o usuário administrador no banco de dados.
 * A senha é lida da variável de ambiente ADMIN_PASSWORD e armazenada como hash bcrypt.
 * Este script pode ser executado várias vezes com segurança (upsert).
 */
async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL e ADMIN_PASSWORD devem estar definidos no arquivo .env');
    process.exit(1);
  }

  await initDatabase();
  const db = getDb();

  // Gera hash bcrypt com salt rounds = 12
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Verifica se o admin já existe
  const existing = db.exec('SELECT id FROM admin_users WHERE email = ?', [email]);

  if (existing.length > 0 && existing[0].values.length > 0) {
    // Atualiza a senha
    db.run('UPDATE admin_users SET password_hash = ? WHERE email = ?', [passwordHash, email]);
    console.log(`✅ Admin atualizado: ${email}`);
  } else {
    // Insere novo admin
    db.run('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
    console.log(`✅ Admin criado: ${email}`);
  }

  // Seed de produtos padrão (somente se a tabela estiver vazia)
  const productCount = db.exec('SELECT COUNT(*) as count FROM products');
  const count = productCount[0]?.values[0]?.[0] as number;

  if (count === 0) {
    const defaultProducts = [
      { id: '1', name: 'CAMISETA OVERSIZED BLACK', category: 'Camisetas', description: 'Camiseta oversized preta com caimento perfeito.', priceOld: 179.90, priceCurrent: 149.90, badge: '-20%', visible: 1, imageFront: '/imagens/tee-black-front.jpg', imageBack: '/imagens/tee-black-back.jpg', stockP: 10, stockM: 15, stockG: 20, stockGG: 5, order: 1 },
      { id: '2', name: 'CAMISETA OVERSIZED OFF-WHITE', category: 'Camisetas', description: 'Camiseta oversized off-white.', priceOld: 179.90, priceCurrent: 149.90, badge: 'COMPRE 3 PAGUE 2', visible: 1, imageFront: '/imagens/tee-white-front.jpg', imageBack: '/imagens/tee-white-back.jpg', stockP: 5, stockM: 10, stockG: 15, stockGG: 2, order: 2 },
      { id: '3', name: 'CALÇA CARGO BAGGY BLACK', category: 'Calças', description: 'Calça cargo baggy preta.', priceOld: 349.90, priceCurrent: 299.00, badge: 'FRETE GRÁTIS', visible: 1, imageFront: '/imagens/pants-black-front.jpg', imageBack: '/imagens/pants-black-back.jpg', stockP: 8, stockM: 12, stockG: 10, stockGG: 4, order: 3 },
      { id: '4', name: 'CALÇA WIDE LEG SAND', category: 'Calças', description: 'Calça wide leg cor areia/bege.', priceOld: 339.90, priceCurrent: 289.00, badge: null, visible: 1, imageFront: '/imagens/pants-beige-front.jpg', imageBack: '/imagens/pants-beige-back.jpg', stockP: 10, stockM: 20, stockG: 15, stockGG: 5, order: 4 },
      { id: '5', name: 'CAMISETA BOXY FIT BLACK', category: 'Camisetas', description: 'Camiseta boxy fit preta.', priceOld: 169.90, priceCurrent: 139.90, badge: '-18%', visible: 1, imageFront: '/imagens/tee-black-back.jpg', imageBack: '/imagens/tee-black-front.jpg', stockP: 12, stockM: 18, stockG: 22, stockGG: 8, order: 5 },
      { id: '6', name: 'CALÇA CARGO UTILITY BLACK', category: 'Calças', description: 'Calça cargo utility preta.', priceOld: 399.90, priceCurrent: 339.00, badge: 'NOVIDADE', visible: 1, imageFront: '/imagens/pants-black-back.jpg', imageBack: '/imagens/pants-black-front.jpg', stockP: 5, stockM: 8, stockG: 12, stockGG: 3, order: 6 },
      { id: '7', name: 'CAMISETA HEAVY OFF-WHITE', category: 'Camisetas', description: 'Camiseta heavy off-white.', priceOld: 189.90, priceCurrent: 159.90, badge: null, visible: 1, imageFront: '/imagens/tee-white-back.jpg', imageBack: '/imagens/tee-white-front.jpg', stockP: 8, stockM: 10, stockG: 14, stockGG: 6, order: 7 },
      { id: '8', name: 'CALÇA PLEATED SAND', category: 'Calças', description: 'Calça pleated areia/bege.', priceOld: 359.90, priceCurrent: 305.00, badge: '-15%', visible: 1, imageFront: '/imagens/pants-beige-back.jpg', imageBack: '/imagens/pants-beige-front.jpg', stockP: 6, stockM: 14, stockG: 10, stockGG: 4, order: 8 },
    ];

    const stmt = db.prepare(`
      INSERT INTO products (id, name, category, description, price_old, price_current, badge, visible, image_front, image_back, stock_p, stock_m, stock_g, stock_gg, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of defaultProducts) {
      stmt.run([p.id, p.name, p.category, p.description, p.priceOld, p.priceCurrent, p.badge, p.visible, p.imageFront, p.imageBack, p.stockP, p.stockM, p.stockG, p.stockGG, p.order]);
    }
    stmt.free();
    console.log(`✅ ${defaultProducts.length} produtos padrão inseridos.`);
  } else {
    console.log(`ℹ️  Tabela de produtos já contém ${count} registros. Seed de produtos ignorado.`);
  }

  saveDb();
  console.log('✅ Seed concluído com sucesso!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
