export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const REPLICATE_TOKEN = 'r8_9R6vapaeCv7UR9HinDW88NBLGuL6HfE4Ht03g';
  const MODEL_VERSION = 'tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abf28aef0a536c851851943';

  try {
    const { action, id, imageData, mimeType } = req.body;

    if (action === 'create') {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: MODEL_VERSION,
          input: {
            prompt: 'img, a person in GTA V game style, rockstar games grand theft auto 5, photorealistic game character, detailed skin texture, cinematic lighting, los santos city, ultra detailed, 4k',
            negative_prompt: 'cartoon, anime, painting, blurry, low quality, deformed face, ugly',
            input_image: `data:${mimeType};base64,${imageData}`,
            style_strength_ratio: 20,
            num_outputs: 1,
            guidance_scale: 5,
            num_inference_steps: 50,
          }
        })
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.detail || 'Gagal' });
      return res.status(200).json({ id: data.id });

    } else if (action === 'check') {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` }
      });
      const data = await response.json();
      return res.status(200).json({ status: data.status, output: data.output, error: data.error });
    }

    return res.status(400).json({ error: 'Action tidak valid' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
    }
