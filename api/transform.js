export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;

  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Token tidak ditemukan' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch(e) {
    return res.status(400).json({ error: 'Body tidak valid' });
  }

  const { action, id, imageData, mimeType } = body;

  try {
    if (action === 'create') {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'pwntus/sdxl-gta-v:c6b5d2b7459910fec94de966af579571dbaf4889b8c6cd6f670afbe00ca4652d',
          input: {
            prompt: 'GTA V style, rockstar games character, photorealistic, cinematic lighting, los santos, detailed',
            image: `data:${mimeType};base64,${imageData}`,
            strength: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 30,
          }
        })
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: text }); }
      if (!response.ok) return res.status(response.status).json({ error: data.detail || 'Gagal' });
      return res.status(200).json({ id: data.id });

    } else if (action === 'check') {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` }
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: text }); }
      return res.status(200).json({ status: data.status, output: data.output, error: data.error });
    }

    return res.status(400).json({ error: 'Action tidak valid' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
