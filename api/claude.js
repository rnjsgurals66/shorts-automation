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
    const { topic, mode, videoAnalysis } = req.body;

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
      // ========== 시니어 이슈풍자쇼츠 프롬프트 ==========
      // 다양한 캐릭터 구도 랜덤 선택
      const characterDuos = [
        { char1: '할아버지 강아지', char2: '손자 강아지', relation: '조손' },
        { char1: '아빠 강아지', char2: '딸 강아지', relation: '부녀' },
        { char1: '엄마 강아지', char2: '아들 강아지', relation: '모자' },
        { char1: '철수 강아지', char2: '영희 강아지', relation: '절친' },
        { char1: '부장 강아지', char2: '신입 강아지', relation: '직장상사와부하' },
        { char1: '선생님 강아지', char2: '학생 강아지', relation: '사제' },
        { char1: '형 강아지', char2: '동생 강아지', relation: '형제' },
        { char1: '언니 강아지', char2: '동생 강아지', relation: '자매' }
      ];
      
      const randomDuo = characterDuos[Math.floor(Math.random() * characterDuos.length)];
      
      prompt = `너는 유튜브 쇼츠 바이럴 전문 작가야.

오늘의 이슈: ${topic}

캐릭터 구도: ${randomDuo.char1}와 ${randomDuo.char2} (${randomDuo.relation} 관계)

[필수 규칙]
1. 첫 문장은 무조건 후킹! 스크롤 멈추게 만들어야 해
   - "야 너 이거 들었어?" / "아니 진짜 어이없는게..." / "세상에 이런 일이..." 등
2. 두 캐릭터가 대화하면서 이슈를 풍자
3. 웃기면서도 날카로운 사회 비판
4. 30초 분량 (약 100-120자, 더 길면 안 됨)
5. 마지막은 한 캐릭터의 한마디로 임팩트 있게 끝내기
6. 절대 설명조 금지! 대화체로만!

[출력 형식]
${randomDuo.char1}: (첫 대사 - 후킹)
${randomDuo.char2}: (반응)
${randomDuo.char1}: (풍자 포인트)
${randomDuo.char2}: (마무리 한마디)

대본:`;

    } else {
      // ========== 쿠팡파트너스 쇼츠 프롬프트 ==========
      prompt = `너는 쿠팡파트너스 쇼츠로 월 500만원 버는 전문가야.

분석된 틱톡 영상 정보: ${topic}
${videoAnalysis ? `영상 분석 결과: ${videoAnalysis}` : ''}

[절대 금지 - 이거 어기면 수익 0원]
1. 상품명 절대 언급 금지! (사람들이 직접 검색하면 내 링크 안 탐)
2. 가격 언급 금지!
3. "이 제품은", "상품명은", "크기는", "사용소감" 같은 리뷰 말투 금지!
4. 설명하는 말투 금지!

[필수 규칙 - 이게 돈 되는 공식]
1. 첫 1초 후킹이 전부야! 
   - "이거 실화냐?" / "와 미쳤다 진짜" / "이게 된다고?" / "헐 대박" 등
2. 상품의 신박한 포인트 "하나만" 극대화
3. 호기심 폭발시켜! "이게 뭐야?" "어디서 사?" 이 반응 끌어내야 함
4. 15-20초 분량 (약 50-70자, 짧을수록 좋음)
5. 끝은 무조건 궁금하게! 답 주지 마!
   - "근데 이게..." / "링크는..." / "ㄹㅇ 개꿀" 등

[터지는 쇼츠 구조]
후킹(1초) → 신박포인트(10초) → 궁금증폭발(3초)

[말투]
- 친구한테 카톡하는 느낌
- 반말 OK
- 감탄사 많이! (와, 헐, 대박, 미쳤다)
- 이모티콘 느낌 살려서

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
