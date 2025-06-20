// Persistent storage for user extraction results (per user, per file)
// Uses localStorage for demo; replace with backend API for production

export interface UserExtractionRecord {
  username: string;
  fileId: string;
  extraction: any;
  role?: string; // Add optional role field for backward compatibility
}

interface UserItemPricesRecord {
  username: string;
  fileId: string;
  itemPrices: any;
}

interface UserCnpDiscountRecord {
  username: string;
  fileId: string;
  cnpDiscount: any;
}

interface UserFinalPricingRecord {
  username: string;
  fileId: string;
  finalPricing: any;
}

interface UserAppliedDiscountsRecord {
  username: string;
  fileId: string;
  appliedDiscounts: Record<string, { salesEngineer: number; salesDirector?: number }>;
}

const STORAGE_KEY = 'user_extraction_results_v1';
const ITEM_PRICES_KEY = 'user_item_prices_v1';
const CNP_DISCOUNT_KEY = 'user_cnp_discount_v1';
const FINAL_PRICING_KEY = 'user_final_pricing_v1';
const APPLIED_DISCOUNTS_KEY = 'user_applied_discounts_v1';

function getAllRecords(): UserExtractionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getAllItemPricesRecords(): UserItemPricesRecord[] {
  try {
    const raw = localStorage.getItem(ITEM_PRICES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getAllCnpDiscountRecords(): UserCnpDiscountRecord[] {
  try {
    const raw = localStorage.getItem(CNP_DISCOUNT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getAllFinalPricingRecords(): UserFinalPricingRecord[] {
  try {
    const raw = localStorage.getItem(FINAL_PRICING_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getAllAppliedDiscountsRecords(): UserAppliedDiscountsRecord[] {
  try {
    const raw = localStorage.getItem(APPLIED_DISCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveExtraction(username: string, fileId: string, extraction: any, role?: string) {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.username === username && r.fileId === fileId);
  if (idx >= 0) {
    records[idx].extraction = extraction;
    if (role) records[idx].role = role; // Update role if provided
  } else {
    records.push({ username, fileId, extraction, role });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getExtraction(username: string, fileId: string): any | null {
  const records = getAllRecords();
  // Return extraction for any user who processed this file (shared across all users)
  const rec = records.find(r => r.fileId === fileId);
  return rec ? rec.extraction : null;
}

export function getProcessedFileIds(username: string): string[] {
  const records = getAllRecords();
  // Return all processed files regardless of who processed them
  const fileIds = records.map(r => r.fileId);
  return Array.from(new Set(fileIds));
}

export function saveItemPrices(username: string, fileId: string, itemPrices: any) {
  const records = getAllItemPricesRecords();
  const idx = records.findIndex((r: UserItemPricesRecord) => r.username === username && r.fileId === fileId);
  if (idx >= 0) {
    records[idx].itemPrices = itemPrices;
  } else {
    records.push({ username, fileId, itemPrices });
  }
  localStorage.setItem(ITEM_PRICES_KEY, JSON.stringify(records));
}

export function getItemPrices(username: string, fileId: string): any | null {
  const records = getAllItemPricesRecords();
  // Return item prices for any user who processed this file (shared across all users)
  const rec = records.find((r: UserItemPricesRecord) => r.fileId === fileId);
  return rec ? rec.itemPrices : null;
}

export function saveCnpDiscount(username: string, fileId: string, cnpDiscount: any) {
  const records = getAllCnpDiscountRecords();
  const idx = records.findIndex((r: UserCnpDiscountRecord) => r.username === username && r.fileId === fileId);
  if (idx >= 0) {
    records[idx].cnpDiscount = cnpDiscount;
  } else {
    records.push({ username, fileId, cnpDiscount });
  }
  localStorage.setItem(CNP_DISCOUNT_KEY, JSON.stringify(records));
}

export function getCnpDiscountData(username: string, fileId: string): any | null {
  const records = getAllCnpDiscountRecords();
  // Return CNP discount for any user who processed this file (shared across all users)
  const rec = records.find((r: UserCnpDiscountRecord) => r.fileId === fileId);
  return rec ? rec.cnpDiscount : null;
}

export function saveFinalPricing(username: string, fileId: string, finalPricing: any) {
  const records = getAllFinalPricingRecords();
  const idx = records.findIndex((r: UserFinalPricingRecord) => r.username === username && r.fileId === fileId);
  if (idx >= 0) {
    records[idx].finalPricing = finalPricing;
  } else {
    records.push({ username, fileId, finalPricing });
  }
  localStorage.setItem(FINAL_PRICING_KEY, JSON.stringify(records));
}

export function getFinalPricing(username: string, fileId: string): any | null {
  const records = getAllFinalPricingRecords();
  // Return final pricing for any user who processed this file (shared across all users)
  const rec = records.find((r: UserFinalPricingRecord) => r.fileId === fileId);
  return rec ? rec.finalPricing : null;
}

// New utility to get a map of fileId to array of usernames with roles who processed it
export function getFileProcessingHistory(): Record<string, string[]> {
  const records = getAllRecords();
  const fileUserMap: Record<string, Set<string>> = {};
  for (const rec of records) {
    if (!fileUserMap[rec.fileId]) fileUserMap[rec.fileId] = new Set();
    // Format: "username (role)" or just "username" if no role
    const userWithRole = rec.role ? `${rec.username} (${rec.role})` : rec.username;
    fileUserMap[rec.fileId].add(userWithRole);
  }
  // Convert Set to Array for serialization
  const result: Record<string, string[]> = {};
  for (const fileId in fileUserMap) {
    result[fileId] = Array.from(fileUserMap[fileId]);
  }
  return result;
}

// Applied Discounts functions
export function saveAppliedDiscounts(username: string, fileId: string, appliedDiscounts: Record<string, { salesEngineer: number; salesDirector?: number }>) {
  const records = getAllAppliedDiscountsRecords();
  // Find by fileId only (shared across all users)
  const idx = records.findIndex((r: UserAppliedDiscountsRecord) => r.fileId === fileId);
  if (idx >= 0) {
    // Update existing record, but keep the original username who first created it
    records[idx].appliedDiscounts = appliedDiscounts;
  } else {
    // Create new record
    records.push({ username, fileId, appliedDiscounts });
  }
  localStorage.setItem(APPLIED_DISCOUNTS_KEY, JSON.stringify(records));
}

export function getAppliedDiscounts(username: string, fileId: string): Record<string, { salesEngineer: number; salesDirector?: number }> | null {
  const records = getAllAppliedDiscountsRecords();
  // Return applied discounts for any user who processed this file (shared across all users)
  const rec = records.find((r: UserAppliedDiscountsRecord) => r.fileId === fileId);
  return rec ? rec.appliedDiscounts : null;
}
