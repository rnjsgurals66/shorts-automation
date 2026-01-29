// Vercel Serverless Function - Claude API
// 23개 바이럴 영상 분석 기반 최적화 프롬프트

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
    const { topic, mode, videoAnalysis } = req.body;

    if (!topic || !mode) {
      return res.status(400).json({ error: 'topic과 mode가 필요합니다' });
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    let prompt = '';
    
    if (mode === 'satire') {
      // ========== 시니어 이슈풍자쇼츠 프롬프트 ==========
      const characterDuos = [
        { char1: '할아버지', char2: '손자' },
        { char1: '아빠', char2: '딸' },
        { char1: '엄마', char2: '아들' },
        { char1: '철수', char2: '영희' },
        { char1: '부장', char2: '신입' },
        { char1: '선생님', char2: '학생' },
        { char1: '형', char2: '동생' },
        { char1: '언니', char2: '동생' }
      ];
      
      const randomDuo = characterDuos[Math.floor(Math.random() * characterDuos.length)];
      
      prompt = `오늘의 이슈: ${topic}

두 캐릭터(${randomDuo.char1}, ${randomDuo.char2})가 대화하는 30초 풍자 대본을 써줘.

규칙:
- 첫 문장은 "야 너 이거 들었어?" 같은 후킹으로 시작
- 4-5문장 대화로 끝
- 반말로 자연스럽게
- 웃기면서 날카롭게 풍자
- 80-100자 이내

출력 형식 (이대로만 출력):
${randomDuo.char1}: (대사)
${randomDuo.char2}: (대사)
${randomDuo.char1}: (대사)
${randomDuo.char2}: (대사)`;

    } else {
      // ========== 쿠팡파트너스 쇼츠 프롬프트 ==========
      
      prompt = `상품 정보: ${topic}
${videoAnalysis ? `영상 분석: ${videoAnalysis}` : ''}

쿠팡파트너스 쇼츠 대본을 써줘. (15-20초 분량)

절대 금지:
- 상품명 언급 금지
- 가격 언급 금지
- "이 제품", "후기", "리뷰" 같은 말 금지
- "링크", "프로필" 언급 금지
- 구조 설명(후킹, 본문 등) 출력 금지

필수:
- 첫 문장은 "친구 집 갔는데...", "이거 없었으면 큰일날 뻔했어", "와 이거 실화야?" 같은 후킹
- 신박한 포인트 하나만 강조
- 친구한테 말하듯 반말로
- 감탄사 넣어서 (와, 헐, 대박)
- 50-70자 이내
- 마지막은 궁금하게 끝내기

대본만 출력해. 다른 설명 없이 바로 대본:`;
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
        max_tokens: 500,
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
