// Simple test without authentication to check data loading
import { readFileSync } from 'fs';
import Papa from 'papaparse';
import path from 'path';

console.log('🔍 Testing CSV data loading directly...\n');

try {
  const csvPath = path.join(process.cwd(), 'app', 'data', 'Cleaned_data.csv');
  console.log('📂 Reading CSV from:', csvPath);
  
  const csvContent = readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data || [];
  console.log(`📊 Total records parsed: ${rows.length}`);
  
  if (rows.length === 0) {
    console.log('❌ No data found in CSV!');
    process.exit(1);
  }

  // Test search for "Vali Mancal Noy"
  const searchTerm = 'Vali Mancal Noy';
  console.log(`\n🔍 Searching for: "${searchTerm}"`);
  
  // Check what column names exist
  const firstRow = rows[0];
  console.log('\n📋 Available columns:', Object.keys(firstRow));
  
  const matches = rows.filter(row => {
    // Check all possible column variations
    const namasteDisplay = row['NAMASTE_DISPLAY'] || row['NUMC_TERM'] || row['namaste_term'];
    const namasteCode = row['NAMASTE_CODE'] || row['NUMC_CODE'] || row['namaste_code'];
    
    if (namasteDisplay && namasteDisplay.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    if (namasteCode && namasteCode.toLowerCase() === searchTerm.toLowerCase()) {
      return true;
    }
    return false;
  });

  console.log(`📋 Found ${matches.length} matches:`);
  matches.forEach((match, index) => {
    console.log(`\n  Match ${index + 1}:`);
    console.log(`    NAMASTE Code: ${match['NAMASTE_CODE'] || match['NUMC_CODE'] || 'N/A'}`);
    console.log(`    NAMASTE Display: ${match['NAMASTE_DISPLAY'] || match['NUMC_TERM'] || 'N/A'}`);
    console.log(`    ICD11 Code: ${match['ICD11_CODE'] || match['ICD_CODE'] || 'N/A'}`);
    console.log(`    ICD11 Display: ${match['ICD11_DISPLAY'] || match['ICD_TERM'] || 'N/A'}`);
  });

  // Show first few records for debugging
  console.log('\n📝 First 3 records in dataset:');
  rows.slice(0, 3).forEach((row, index) => {
    console.log(`\n  Record ${index + 1}:`);
    console.log(`    NAMASTE Code: ${row['NAMASTE_CODE'] || row['NUMC_CODE'] || 'N/A'}`);
    console.log(`    NAMASTE Display: ${row['NAMASTE_DISPLAY'] || row['NUMC_TERM'] || 'N/A'}`);
    console.log(`    ICD11 Code: ${row['ICD11_CODE'] || row['ICD_CODE'] || 'N/A'}`);
    console.log(`    ICD11 Display: ${row['ICD11_DISPLAY'] || row['ICD_TERM'] || 'N/A'}`);
  });

} catch (error) {
  console.error('❌ Error testing CSV loading:', error);
  process.exit(1);
}