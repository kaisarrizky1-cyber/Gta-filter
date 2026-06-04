export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;

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
          version: 'batouresearch/magic-image-refiner:507ddf6f977a7e30e46c0daefd30de7d563c72322f9e4cf7cbac52ef0f667b13',
          input: {
            image: `data:${mimeType};base64,${imageData}`,
            prompt: 'GTA V game style, rockstar games, photorealistic game character, detailed skin texture, cinematic lighting, los santos, ultra detailed 4k',
            negative_prompt: 'blurry, low quality, ugly, deformed',
            steps: 20,
            strength: 0.5,
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
}      if (!response.ok) return res.status(response.status).json({ error: data.detail || 'Gagal' });
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
