export default async function handler(req, res) {

  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Vercel às vezes não parseia o body automaticamente — garante leitura correta
    let body = req.body;

    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    // Se ainda vier vazio, lê o stream manualmente
    if (!body || Object.keys(body).length === 0) {
      body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
        req.on('error', reject);
      });
    }

    const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': 'tinono763_soita0af0kxoque6',
        'x-secret-key': 'elnxof95t5sgzr7voj0h2eem085s1ef3e7onvzevpnj4ki34endc6dt0hndyjmlu'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error('[SigiloPay Proxy] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao chamar a API de pagamento.' });
  }
}