const axios = require('axios');

// Test the main terminology search API endpoint
async function testMainAPI() {
    const searchTerm = "Vali Mancal Noy";
    
    try {
        console.log(`Testing main API: /api/terminology/search for "${searchTerm}"`);
        
        const response = await axios.get('http://localhost:3001/api/terminology/search', {
            params: { query: searchTerm },
            timeout: 10000
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.mappings && response.data.mappings.length > 0) {
            console.log('\n✅ SUCCESS: Found mappings!');
            response.data.mappings.forEach((mapping, i) => {
                console.log(`Mapping ${i + 1}:`, mapping);
            });
        } else {
            console.log('\n❌ No mappings found in response');
        }
        
    } catch (error) {
        console.error('❌ Error testing main API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testMainAPI();