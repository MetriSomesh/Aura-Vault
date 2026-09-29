import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabaseAsync('aura_vault.db');
  await initTables(dbInstance);
  return dbInstance;
}

export function getDatabaseSync(): SQLite.SQLiteDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = SQLite.openDatabaseSync('aura_vault.db');
  initTablesSync(dbInstance);
  return dbInstance;
}

function initTablesSync(db: SQLite.SQLiteDatabase): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      metal_type TEXT NOT NULL,
      title TEXT NOT NULL,
      purity_karat TEXT NOT NULL,
      purity_percentage REAL NOT NULL,
      gross_weight_grams REAL NOT NULL,
      pure_weight_grams REAL NOT NULL,
      purchase_rate_per_gram REAL NOT NULL,
      making_charges REAL NOT NULL DEFAULT 0,
      gst_percentage REAL NOT NULL DEFAULT 3.0,
      gst_amount REAL NOT NULL,
      total_cost REAL NOT NULL,
      break_even_rate REAL NOT NULL,
      custody_location TEXT NOT NULL,
      huid_code TEXT,
      invoice_photo_uri TEXT,
      purchase_date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS spot_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      gold_24k_1g REAL NOT NULL,
      silver_999_1g REAL NOT NULL
    );
  `);
}

async function initTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      metal_type TEXT NOT NULL,
      title TEXT NOT NULL,
      purity_karat TEXT NOT NULL,
      purity_percentage REAL NOT NULL,
      gross_weight_grams REAL NOT NULL,
      pure_weight_grams REAL NOT NULL,
      purchase_rate_per_gram REAL NOT NULL,
      making_charges REAL NOT NULL DEFAULT 0,
      gst_percentage REAL NOT NULL DEFAULT 3.0,
      gst_amount REAL NOT NULL,
      total_cost REAL NOT NULL,
      break_even_rate REAL NOT NULL,
      custody_location TEXT NOT NULL,
      huid_code TEXT,
      invoice_photo_uri TEXT,
      purchase_date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS spot_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      gold_24k_1g REAL NOT NULL,
      silver_999_1g REAL NOT NULL
    );
  `);
}
