import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'duofreitas.db');

let db: SqlJsDatabase;

/** Salva o banco de dados no disco */
function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/** Inicializa o banco de dados e cria as tabelas se não existirem */
export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Tabela de administradores
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Tabela de produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_old REAL,
      price_current REAL NOT NULL,
      badge TEXT,
      visible INTEGER NOT NULL DEFAULT 1,
      image_front TEXT NOT NULL DEFAULT '',
      image_back TEXT NOT NULL DEFAULT '',
      stock_p INTEGER NOT NULL DEFAULT 0,
      stock_m INTEGER NOT NULL DEFAULT 0,
      stock_g INTEGER NOT NULL DEFAULT 0,
      stock_gg INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Tabela de configurações do site
  db.run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_slides TEXT NOT NULL DEFAULT '[]',
      theme_color_offwhite TEXT NOT NULL DEFAULT '#fce8eb',
      theme_color_white TEXT NOT NULL DEFAULT '#fff5f7',
      theme_color_black TEXT NOT NULL DEFAULT '#3a2e30',
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Insere configuração padrão se não existir
  const settingsCount = db.exec('SELECT COUNT(*) FROM site_settings');
  if (settingsCount[0]?.values[0]?.[0] === 0) {
    db.run(`
      INSERT INTO site_settings (id, hero_slides, theme_color_offwhite, theme_color_white, theme_color_black)
      VALUES (1, '["/imagens/hero-1.jpg"]', '#fce8eb', '#fff5f7', '#3a2e30')
    `);
  }

  saveDb();
  return db;
}

/** Retorna a instância do banco de dados */
export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/** Salva alterações pendentes no disco */
export { saveDb };
