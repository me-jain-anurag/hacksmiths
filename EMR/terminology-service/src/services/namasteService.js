import fs from 'fs';
import path from 'path';

// Mock CSV lookup
const namasteDB = [
  { code: 'NAMASTE_1023', term: 'Amlapitta', description: 'Acid Dyspepsia' },
  { code: 'NAMASTE_1001', term: 'Jwara', description: 'Fever' }
];

export const searchNamaste = async (query) => {
  const result = namasteDB.find(item => item.term.toLowerCase() === query.toLowerCase());
  if (!result) throw new Error('No NAMASTE term found');
  return result;
};
