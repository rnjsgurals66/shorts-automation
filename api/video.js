// Vercel Serverless Function - Creatomate 영상 생성 API
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
    const { script, audioUrl, mode } = req.body;

    if (!script) {
      return res.status(400).json({ error: 'script가 필요합니다' });
    }

    const apiKey = process.env.CREATOMATE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Creatomate API 키가 설정되지 않았습니다' });
    }

    // Creatomate API로 영상 생성
    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: null, // 템플릿 없이 직접 생성
        output_format: 'mp4',
        width: 1080,
        height: 1920, // 세로 영상 (쇼츠)
        frame_rate: 30,
        duration: 60,
        elements: [
          // 배경
          {
            type: 'shape',
            shape: 'rectangle',
            width: '100%',
            height: '100%',
            fill_color: mode === 'satire' ? '#1a1a2e' : '#ffffff'
          },
          // 자막 텍스트
          {
            type: 'text',
            text: script.substring(0, 200),
            font_family: 'Noto Sans KR',
            font_weight: 700,
            font_size: '48px',
            fill_color: mode === 'satire' ? '#ffffff' : '#000000',
            x: '50%',
            y: '80%',
            width: '90%',
            x_anchor: '50%',
            y_anchor: '50%',
            text_align: 'center'
          },
          // 오디오 (있는 경우)
          ...(audioUrl ? [{
            type: 'audio',
            source: audioUrl
          }] : [])
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'Creatomate API 오류', details: error });
    }

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true,
      renderId: data[0]?.id,
      status: data[0]?.status,
      url: data[0]?.url
    });

  } catch (error) {
    console.error('영상 생성 오류:', error);
    return res.status(500).json({ error: '서버 오류', message: error.message });
  }
}
