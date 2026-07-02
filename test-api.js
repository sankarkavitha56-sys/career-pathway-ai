// Test file to verify API integration
const RAPIDAPI_KEY = '24e61af88cmshe6fe9545912f091p1051fajsnf3e2c2ca2723';
const API_HOST = 'jsearch.p.rapidapi.com';

async function testFetch() {
  const url = new URL(`https://${API_HOST}/search`);
  url.searchParams.append('query', 'frontend developer remote');
  url.searchParams.append('page', '1');
  url.searchParams.append('num_pages', '2');
  url.searchParams.append('country', 'us');
  url.searchParams.append('date_posted', 'all');

  console.log('🔍 Testing API Call...');
  console.log('URL:', url.toString());
  console.log('API Key Set:', !!RAPIDAPI_KEY);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': API_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    console.log('✅ Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Response Data:', data);
    console.log('✅ Jobs Count:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      console.log('First Job:', data.data[0]);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testFetch();
