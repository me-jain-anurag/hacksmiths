// lib/namasteLoader.ts
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export type NormalizedRow = {
  namaste_code?: string;
  namaste_term?: string;
  namaste_description?: string;
  icd11_code?: string;
  icd11_title?: string;
  icd11_description?: string;
  // keep original row if needed
  raw?: Record<string, string>;
};

let CACHE: NormalizedRow[] | null = null;

function pickFirst(row: Record<string, string>, candidates: string[]) {
  for (const c of candidates) {
    for (const key of Object.keys(row)) {
      if (key.trim().toLowerCase() === c) return row[key];
    }
  }
  return undefined;
}

export function loadNamasteDataSync(): NormalizedRow[] {
  if (CACHE) return CACHE;

  const csvPath = path.join(process.cwd(), 'app', 'data', 'Cleaned_data.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('[namasteLoader] CSV not found at', csvPath);
    CACHE = [];
    return CACHE;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data || [];

  CACHE = rows.map((r: Record<string, string>) => {
    // normalize keys by lowercasing and trimming
    const normalized: Record<string, string> = {};
    for (const k of Object.keys(r)) normalized[k.trim().toLowerCase()] = (r[k] ?? '').toString().trim();

    // candidate header names:
    const namasteCode = pickFirst(normalized, ['namaste_code', 'numc_code', 'numc_code', 'code', 'namastecode', 'numc_code']);
    const namasteTerm = pickFirst(normalized, ['namaste_term', 'numc_term', 'term', 'name', 'namasteterm']);
    const namasteDesc = pickFirst(normalized, ['namaste_description', 'description', 'namastadescription', 'desc']);

    const icd11Code = pickFirst(normalized, ['icd11_code', 'icd_code', 'icd_code', 'icd11', 'icd']);
    const icd11Title = pickFirst(normalized, ['icd11_title', 'icd_term', 'icd_term', 'icd_title', 'icd11title']);
    const icd11Desc = pickFirst(normalized, ['icd11_description', 'icd_description', 'longdescription', 'longdefinition']);

    return {
      namaste_code: namasteCode ? namasteCode : undefined,
      namaste_term: namasteTerm ? namasteTerm : undefined,
      namaste_description: namasteDesc ? namasteDesc : undefined,
      icd11_code: icd11Code ? icd11Code : undefined,
      icd11_title: icd11Title ? icd11Title : undefined,
      icd11_description: icd11Desc ? icd11Desc : undefined,
      raw: r,
    } as NormalizedRow;
  });

  return CACHE;
}
