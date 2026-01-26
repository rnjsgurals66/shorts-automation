// Vercel Serverless Function - Claude API

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
    const { topic, mode } = req.body;

    if (!topic || !mode) {
      return res.status(400).json({ error: 'topic과 mode가 필요합니다' });
    }

    // 환경변수에서 API 키 가져오기
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    // 프롬프트 생성
    let prompt = '';
    if (mode === 'satire') {
      prompt = `다음 뉴스를 바탕으로 60초 분량의 풍자 쇼츠 대본을 작성해주세요.

뉴스: ${topic}

형식:
- 할아버지 강아지와 손자 강아지의 대화
- 재치있고 위트있는 사회 풍자
- 60초 분량 (약 150-200자)

대본:`;
    } else {
      prompt = `다음 상품에 대한 60초 분량의 리뷰 대본을 작성해주세요.

상품: ${topic}

형식:
- 실제 사용 후기
- 장단점 소개
- 60초 분량 (약 150-200자)

대본:`;
    }

    // Claude API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: 'Claude API 오류', details: error });
    }

    const data = await response.json();
    const script = data.content[0].text;

    return res.status(200).json({ script });

  } catch (error) {
    console.error('오류:', error);
    return res.status(500).json({ error: '서버 오류', message: error.message });
  }
}
