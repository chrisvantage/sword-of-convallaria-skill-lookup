const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    const response = await axios.get('https://docs.google.com/spreadsheets/d/10YZra-FKNCClwlBpGJ8w-O_nikQ3GmMnlzlWcxi-1rg/pub?gid=1076834980&single=true&output=csv');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/csv'
      },
      body: response.data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' })
    };
  }
};