const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); //cache for 1 hour

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };
  
  try {
    const cacheKey = 'skillsData';
    let data = cache.get(cacheKey);

    if (data === undefined){
      console.log('Cache miss. Fetching from Google Sheets...');
        const response = await axios.get(process.env.GOOGLE_SHEET_CSV_URL);
        data = response.data;
        console.log('Data fetched. First 200 characters:', data.substring(0, 200));
        cache.set(cacheKey, data);
    } else {
      console.log('Serving data from cache. First 200 characters:', data.substring(0, 200));
    }
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, max-age=3600'
      },
      body: data
    };
  } catch (error) {
    console.error('Error fetching skills:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch data', details: error.message })
    };
  }
};