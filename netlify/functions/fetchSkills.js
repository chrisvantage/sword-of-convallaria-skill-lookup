const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); //cache for 1 hour

exports.handler = async function(event, context) {
  try {
    const cacheKey = 'skillsData';
    let data = cache.get(cacheKey);

    if (data === undefined){
        const response = await axios.get(process.env.GOOGLE_SHEET_CSV_URL);
        data = response.data;
        cache.set(cacheKey, data);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/csv'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};