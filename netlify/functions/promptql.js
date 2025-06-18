const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

    if (!deepseekApiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'DEEPSEEK_API_KEY environment variable not set.' }),
        };
    }

    try {
        const incomingData = JSON.parse(event.body);
        const { model, messages } = incomingData;

        if (!model || !messages) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing "model" or "messages" in the request body.' }),
            };
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Deepseek API Error:', errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Error from Deepseek API', details: errorData }),
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal error occurred.', details: error.message }),
        };
    }
}; 