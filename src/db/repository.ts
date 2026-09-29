import { Holding, NewHoldingInput } from '../types/bullion';
import { getDatabase } from './database';

interface HoldingDbRow {
  id: string;
  metal_type: string;
  title: string;
  purity_karat: string;
  purity_percentage: number;
  gross_weight_grams: number;
  pure_weight_grams: number;
  purchase_rate_per_gram: number;
  making_charges: number;
  gst_percentage: number;
  gst_amount: number;
  total_cost: number;
  break_even_rate: number;
  custody_location: string;
  huid_code: string | null;
  invoice_photo_uri: string | null;
  purchase_date: string;
  created_at: number;
  updated_at: number;
}

function mapRowToHolding(row: HoldingDbRow): Holding {
  return {
    id: row.id,
    metalType: row.metal_type as Holding['metalType'],
    title: row.title,
    purityKarat: row.purity_karat as Holding['purityKarat'],
    purityPercentage: row.purity_percentage,
    grossWeightGrams: row.gross_weight_grams,
    pureWeightGrams: row.pure_weight_grams,
    purchaseRatePerGram: row.purchase_rate_per_gram,
    makingCharges: row.making_charges,
    gstPercentage: row.gst_percentage,
    gstAmount: row.gst_amount,
    totalCost: row.total_cost,
    breakEvenRate: row.break_even_rate,
    custodyLocation: row.custody_location,
    huidCode: row.huid_code ?? undefined,
    invoicePhotoUri: row.invoice_photo_uri ?? undefined,
    purchaseDate: row.purchase_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllHoldings(): Promise<Holding[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<HoldingDbRow>(
    `SELECT * FROM holdings ORDER BY created_at DESC;`
  );
  return rows.map(mapRowToHolding);
}

export async function getHoldingById(id: string): Promise<Holding | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<HoldingDbRow>(
    `SELECT * FROM holdings WHERE id = ?;`,
    [id]
  );
  return row ? mapRowToHolding(row) : null;
}

export async function insertHolding(input: NewHoldingInput): Promise<Holding> {
  const db = await getDatabase();
  const id = `holding_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO holdings (
      id, metal_type, title, purity_karat, purity_percentage,
      gross_weight_grams, pure_weight_grams, purchase_rate_per_gram,
      making_charges, gst_percentage, gst_amount, total_cost,
      break_even_rate, custody_location, huid_code, invoice_photo_uri,
      purchase_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      input.metalType,
      input.title,
      input.purityKarat,
      input.purityPercentage,
      input.grossWeightGrams,
      input.pureWeightGrams,
      input.purchaseRatePerGram,
      input.makingCharges,
      input.gstPercentage,
      input.gstAmount,
      input.totalCost,
      input.breakEvenRate,
      input.custodyLocation,
      input.huidCode ?? null,
      input.invoicePhotoUri ?? null,
      input.purchaseDate,
      now,
      now,
    ]
  );

  return {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateHolding(
  id: string,
  input: Partial<NewHoldingInput>
): Promise<Holding | null> {
  const existing = await getHoldingById(id);
  if (!existing) return null;

  const db = await getDatabase();
  const updated: Holding = {
    ...existing,
    ...input,
    updatedAt: Date.now(),
  };

  await db.runAsync(
    `UPDATE holdings SET
      metal_type = ?, title = ?, purity_karat = ?, purity_percentage = ?,
      gross_weight_grams = ?, pure_weight_grams = ?, purchase_rate_per_gram = ?,
      making_charges = ?, gst_percentage = ?, gst_amount = ?, total_cost = ?,
      break_even_rate = ?, custody_location = ?, huid_code = ?, invoice_photo_uri = ?,
      purchase_date = ?, updated_at = ?
    WHERE id = ?;`,
    [
      updated.metalType,
      updated.title,
      updated.purityKarat,
      updated.purityPercentage,
      updated.grossWeightGrams,
      updated.pureWeightGrams,
      updated.purchaseRatePerGram,
      updated.makingCharges,
      updated.gstPercentage,
      updated.gstAmount,
      updated.totalCost,
      updated.breakEvenRate,
      updated.custodyLocation,
      updated.huidCode ?? null,
      updated.invoicePhotoUri ?? null,
      updated.purchaseDate,
      updated.updatedAt,
      id,
    ]
  );

  return updated;
}

export async function deleteHolding(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync(`DELETE FROM holdings WHERE id = ?;`, [id]);
  return result.changes > 0;
}

export async function clearAllHoldings(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM holdings;`);
}

/**
 * No demo data - user manages real physical holdings exclusively.
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  return;
}
