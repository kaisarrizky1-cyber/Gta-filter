export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
  return res.status(500).json({
    error: 'HF_TOKEN tidak ditemukan'
  });
}
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch(e) {
    return res.status(400).json({ error: 'Body tidak valid' });
  }

  const { prompt } = body;

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `GTA V game style, rockstar games, ${prompt}, photorealistic game character, cinematic lighting, los santos, ultra detailed 4k`,
        parameters: {
          negative_prompt: 'blurry, low quality, ugly, deformed, cartoon, anime',
          num_inference_steps: 25,
          guidance_scale: 7.5,
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return res.status(200).json({ image: `data:image/jpeg;base64,${base64}` });

  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
