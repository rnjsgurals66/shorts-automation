// Vercel Serverless Function - Creatomate 영상 생성 API
// 23개 바이럴 영상 분석 기반 영상 설정

export default async function handler(req, res) {
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

    // ═══════════════════════════════════════════════════
    // 23개 바이럴 영상 분석 기반 자막 스타일
    // ═══════════════════════════════════════════════════
    // 분석 결과:
    // - 노란색 강조 + 검은 테두리 (가장 많이 사용)
    // - 굵은 고딕체
    // - 중앙 또는 하단 배치
    // - 핵심 단어 강조
    
    const subtitleStyles = {
      coupang: {
        bgColor: '#000000',           // 검은 배경 (상품이 돋보이게)
        textColor: '#FFFF00',         // 노란색 텍스트 (시선 집중)
        strokeColor: '#000000',       // 검은 테두리
        strokeWidth: 4,
        fontFamily: 'Noto Sans KR',
        fontWeight: '900',            // 아주 굵게
        fontSize: '8 vmin',           // 크게
        position: 'center'            // 중앙
      },
      satire: {
        bgColor: '#1a1a2e',           // 어두운 남색 (풍자 분위기)
        textColor: '#FFFFFF',         // 흰색 텍스트
        strokeColor: '#000000',
        strokeWidth: 3,
        fontFamily: 'Noto Sans KR',
        fontWeight: '700',
        fontSize: '7 vmin',
        position: 'center'
      }
    };

    const style = mode === 'satire' ? subtitleStyles.satire : subtitleStyles.coupang;

    // Creatomate API로 영상 생성
    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        output_format: 'mp4',
        width: 1080,
        height: 1920,
        frame_rate: 30,
        duration: audioUrl ? null : 15,  // 오디오 있으면 오디오 길이에 맞춤
        source: {
          elements: [
            // 배경
            {
              type: 'composition',
              track: 1,
              elements: [
                {
                  type: 'shape',
                  track: 1,
                  shape: 'rectangle',
                  width: '100%',
                  height: '100%',
                  fill_color: style.bgColor
                },
                // 자막 텍스트
                {
                  type: 'text',
                  track: 2,
                  text: script.substring(0, 300),
                  font_family: style.fontFamily,
                  font_weight: style.fontWeight,
                  font_size: style.fontSize,
                  fill_color: style.textColor,
                  stroke_color: style.strokeColor,
                  stroke_width: style.strokeWidth,
                  x: '50%',
                  y: '50%',
                  width: '85%',
                  x_anchor: '50%',
                  y_anchor: '50%',
                  text_align: 'center'
                }
              ]
            },
            // 오디오 (있을 경우)
            ...(audioUrl ? [{
              type: 'audio',
              track: 2,
              source: audioUrl
            }] : [])
          ]
        }
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
