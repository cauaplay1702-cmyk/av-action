const https = require('https');

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { messages, model, max_tokens } = JSON.parse(event.body || '{}');
    const apiKey = process.env.ANTHROPIC_KEY || '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';

    const postData = JSON.stringify({
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: max_tokens || 1200,
      messages: messages
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        port: 443,
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    const parsed = JSON.parse(result);
    const texto = parsed.content?.map(b => b.text || '').join('') || 'Sem resposta.';
    return { statusCode: 200, headers, body: JSON.stringify({ texto }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ texto: 'Erro: ' + err.message }) };
  }
};
