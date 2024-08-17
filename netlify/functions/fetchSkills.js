const axios = require('axios');
const NodeCache = require('node-cache');
const Papa = require('papaparse');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

exports.handler = async function(event, context) {
  console.log('Function invoked');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    const cacheKey = 'skillsData';
    let data = cache.get(cacheKey);

    if (data === undefined) {
      console.log('Cache miss. Fetching from Google Sheets...');
      const response = await axios.get(process.env.GOOGLE_SHEET_CSV_URL);
      console.log('Google Sheets response received');
      data = response.data;
      console.log('Data fetched. First 200 characters:', data.substring(0, 200));
      
      // Validate and parse CSV
      const parsedData = Papa.parse(data, { header: true });
      console.log('CSV parsed. Number of rows:', parsedData.data.length);
      console.log('First row:', JSON.stringify(parsedData.data[0]));
      
      // Reformat data if necessary
      const formattedData = parsedData.data.map(row => ({
        name_global: row.name_global || '',
        desc_global: row.desc_global || '',
        unit_global: row.unit_global || ''
      }));
      
      data = Papa.unparse(formattedData);
      console.log('Data formatted. First 200 characters:', data.substring(0, 200));
      
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
    console.error('Error fetching or processing skills:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch or process data', details: error.message })
    };
  }
};