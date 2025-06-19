const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. Verify the request is a POST request
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // 2. Securely get the API key from environment variables
    const { DEEPSEEK_API_KEY } = process.env;
    if (!DEEPSEEK_API_KEY) {
        console.error('DEEPSEEK_API_KEY is not set.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: Missing API key.' }),
        };
    }

    try {
        // 3. Parse the incoming request body
        const body = JSON.parse(event.body);
        const prompt = body.prompt;

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Bad Request: "prompt" is required.' }),
            };
        }

        // 4. Call the Deepseek API
        const deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions'; 
        const response = await fetch(deepseekApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: "deepseek-reasoner", // As per the user's request
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                // You can add other parameters here as needed, like temperature, max_tokens, etc.
            }),
        });

        // 5. Handle the response from the Deepseek API
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Deepseek API Error:', errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to get a response from the AI service.', details: errorBody }),
            };
        }

        const data = await response.json();

        // 6. Return the successful response
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        // 7. Catch any other errors (e.g., JSON parsing, network issues)
        console.error('An unexpected error occurred:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.', details: error.message }),
        };
    }
}; 