const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

    if (!deepseekApiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'DEEPSEEK_API_KEY environment variable not set.' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    try {
        // The entire body from the client will be forwarded to the Deepseek API.
        const requestBody = event.body;

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`,
            },
            body: requestBody, // Pass the original request body directly
        });

        // The response from Deepseek will be streamed back to the client.
        return {
            statusCode: response.status,
            headers: { 'Content-Type': 'application/json' },
            body: await response.text(),
        };

    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal error occurred.', details: error.message }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
}; 