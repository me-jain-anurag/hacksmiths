import { loadNamasteDataSync } from './lib/namasteLoader.js';

console.log('🔍 Testing namasteLoader with uploaded data...\n');

try {
  const data = loadNamasteDataSync();
  console.log(`📊 Total records loaded: ${data.length}`);
  
  if (data.length === 0) {
    console.log('❌ No data loaded from CSV!');
    process.exit(1);
  }

  // Test search for "Vali Mancal Noy"
  const searchTerm = 'Vali Mancal Noy';
  console.log(`\n🔍 Searching for: "${searchTerm}"`);
  
  const matches = data.filter(row => {
    if (row.namaste_term && row.namaste_term.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    if (row.namaste_code && row.namaste_code.toLowerCase() === searchTerm.toLowerCase()) {
      return true;
    }
    return false;
  });

  console.log(`📋 Found ${matches.length} matches:`);
  matches.forEach((match, index) => {
    console.log(`\n  Match ${index + 1}:`);
    console.log(`    NAMASTE Code: ${match.namaste_code || 'N/A'}`);
    console.log(`    NAMASTE Term: ${match.namaste_term || 'N/A'}`);
    console.log(`    ICD11 Code: ${match.icd11_code || 'N/A'}`);
    console.log(`    ICD11 Title: ${match.icd11_title || 'N/A'}`);
  });

  // Show first few records for debugging
  console.log('\n📝 First 3 records in dataset:');
  data.slice(0, 3).forEach((row, index) => {
    console.log(`\n  Record ${index + 1}:`);
    console.log(`    NAMASTE Code: ${row.namaste_code || 'N/A'}`);
    console.log(`    NAMASTE Term: ${row.namaste_term || 'N/A'}`);
    console.log(`    ICD11 Code: ${row.icd11_code || 'N/A'}`);
    console.log(`    ICD11 Title: ${row.icd11_title || 'N/A'}`);
  });

} catch (error) {
  console.error('❌ Error testing namasteLoader:', error);
  process.exit(1);
}