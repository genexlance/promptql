# PromptQL Universal LLM Proxy

This Netlify function serves as a universal, pass-through proxy for Large Language Model (LLM) APIs. It is designed to be a secure and simple bridge for applications that cannot run Node.js on their own servers (such as a standard WordPress host).

## How It Works

The proxy is intentionally "dumb." It doesn't contain any logic about prompt structures, models, or API parameters. Its sole responsibility is to:

1.  Receive a POST request from a client application (e.g., a WordPress plugin).
2.  Take the *entire* JSON body from that request.
3.  Forward that exact body to the target LLM API endpoint.
4.  Add the appropriate `Authorization` header, using an API key stored securely as a Netlify environment variable.
5.  Stream the response from the LLM API directly back to the original client.

This architecture keeps application-specific logic and prompts within the client application, allowing this proxy to be used by any service for any purpose.

## Configuration

1.  **Deployment:** Deploy this project to your Netlify account.
2.  **Environment Variable:** In your Netlify site settings (under "Build & deploy" > "Environment"), create a new environment variable:
    -   **Key:** `DEEPSEEK_API_KEY`
    -   **Value:** Your secret API key for the Deepseek service.
3.  **Endpoint:** The function will be available at `https://YOUR_NETLIFY_APP_NAME.netlify.app/.netlify/functions/promptql`.

## Usage

To use the proxy, send a `POST` request to the Netlify function's URL. The body of your request should be a JSON object formatted exactly as required by the target LLM API.

### Example Request from a Client

Your client application would construct a request like this:

```javascript
// Example using JavaScript's fetch API

const proxyUrl = 'https://YOUR_NETLIFY_APP_NAME.netlify.app/.netlify/functions/promptql';

const requestBody = {
    model: "deepseek-reasoner",
    messages: [
        {
            role: "system",
            content: "You are a helpful assistant."
        },
        {
            role: "user",
            content: "Hello, world!"
        }
    ],
    max_tokens: 1024,
    temperature: 0.7
};

fetch(proxyUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
})
.then(response => response.json())
.then(data => {
    console.log(data.choices[0].message.content);
})
.catch(error => {
    console.error('Error:', error);
});
``` 