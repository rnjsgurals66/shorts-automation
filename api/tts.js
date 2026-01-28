// Vercel Serverless Function - ElevenLabs TTS API
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text가 필요합니다' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    // 음성 ID 매핑 (한국어 지원 음성)
    const voiceIds = {
      '할아버지': 'ODq5zmih8GrVes37Dizd',  // Patrick
      '손자': 'jBpfuIE2acCO8z3wKNLl',       // Gigi
      '기본': 'twenty_one_savage'           // 기본 음성
    };

    const voiceId = voiceIds[voice] || voiceIds['기본'];

    // ElevenLabs API 호출
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'ElevenLabs API 오류', details: error });
    }

    // 오디오 데이터를 base64로 변환
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return res.status(200).json({ audioUrl });

  } catch (error) {
    console.error('오류:', error);
    return res.status(500).json({ error: '서버 오류', message: error.message });
  }
}
