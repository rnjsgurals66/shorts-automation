// Vercel Serverless Function - Claude API
// 23개 바이럴 영상 분석 기반 최적화 프롬프트

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

    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    let prompt = '';
    
    if (mode === 'satire') {
      // ========== 시니어 이슈풍자쇼츠 프롬프트 ==========
      const characterDuos = [
        { char1: '할아버지 강아지', char2: '손자 강아지', relation: '조손', style: '구수한 사투리 vs 요즘 말투' },
        { char1: '아빠 강아지', char2: '딸 강아지', relation: '부녀', style: '걱정 가득 vs 쿨한 반응' },
        { char1: '엄마 강아지', char2: '아들 강아지', relation: '모자', style: '잔소리 vs 귀찮음' },
        { char1: '철수', char2: '영희', relation: '절친', style: '흥분 vs 냉정 툿코' },
        { char1: '김부장', char2: '박신입', relation: '직장', style: '꼰대 vs MZ' },
        { char1: '선생님', char2: '학생', relation: '사제', style: '훈계 vs 딴청' },
        { char1: '형', char2: '동생', relation: '형제', style: '아는척 vs 팩트폭행' },
        { char1: '언니', char2: '동생', relation: '자매', style: '걱정 vs 현실직시' }
      ];
      
      const randomDuo = characterDuos[Math.floor(Math.random() * characterDuos.length)];
      
      prompt = `너는 유튜브 쇼츠 1000만 조회수 전문 작가야.

오늘의 이슈: ${topic}

캐릭터: ${randomDuo.char1} vs ${randomDuo.char2} (${randomDuo.relation})
말투 스타일: ${randomDuo.style}

═══════════════════════════════════
[필수 규칙] 이거 안 지키면 조회수 0
═══════════════════════════════════

1. 첫 문장 = 후킹 (스크롤 멈추게!)
   예시:
   - "야 너 이거 들었어?"
   - "아니 진짜 어이없는 게..."
   - "세상에 이런 일이..."
   - "요즘 애들은 진짜..."

2. 대화 구조 (4-5문장이 끝!)
   ${randomDuo.char1}: (후킹 - 이슈 던지기)
   ${randomDuo.char2}: (리액션 - 놀람/의문)
   ${randomDuo.char1}: (풍자 포인트 - 핵심 한방)
   ${randomDuo.char2}: (마무리 - 임팩트 한마디)

3. 분량: 25-30초 (80-100자)
   - 이거 넘기면 이탈률 폭발

4. 금지사항:
   - 설명조 금지 (뉴스 앵커 말투 ㄴㄴ)
   - "~입니다", "~합니다" 금지
   - 교훈적인 마무리 금지

5. 필수사항:
   - 반말 + 감탄사 (헐, 대박, 미쳤다)
   - 웃기면서 날카롭게
   - 끝은 여운 남기기 (답 주지 마)

대본:`;

    } else {
      // ========== 쿠팡파트너스 쇼츠 프롬프트 ==========
      // 23개 바이럴 영상 분석 기반
      
      const hookingStyles = [
        { type: '공포형', example: '이거 없었으면 전 재산 날릴 뻔했어요', emotion: '다급함, 안도' },
        { type: '발견형', example: '친구 집에 갔는데 뭔가 특이한 거예요', emotion: '호기심, 신기함' },
        { type: '위기형', example: '시어머니한테 등짝 맞을 뻔했어요', emotion: '억울함, 쭈굴' },
        { type: '감탄형', example: '와, 이건 어떤 천재가 만든 거죠?', emotion: '감탄, 흥분' },
        { type: '도발형', example: '아직도 물티슈로 닦으세요?', emotion: '핀잔, 우월감' },
        { type: '허세형', example: '요즘 부자들 사이에서 유행하는~', emotion: '은밀함, 정보공유' },
        { type: '후회형', example: '이걸 왜 이제 알았을까요', emotion: '후회, 아쉬움' },
        { type: '충격형', example: '이거 실화냐?', emotion: '놀람, 충격' }
      ];
      
      const randomHook = hookingStyles[Math.floor(Math.random() * hookingStyles.length)];
      
      prompt = `너는 쿠팡파트너스로 월 1000만원 버는 쇼츠 전문가야.
23개 바이럴 영상을 분석한 결과를 기반으로 대본을 써.

상품/영상 정보: ${topic}
${videoAnalysis ? `영상 분석: ${videoAnalysis}` : ''}

오늘의 후킹 스타일: ${randomHook.type}
참고 예시: "${randomHook.example}"
감정 톤: ${randomHook.emotion}

═══════════════════════════════════
[절대 금지] 이거 어기면 수익 0원
═══════════════════════════════════

1. 상품명 언급 금지! (검색해서 내 링크 안 탐)
2. 가격 언급 금지!
3. "이 제품은", "사용해보니", "후기" 같은 리뷰 말투 금지!
4. "링크 타고 가세요", "프로필에서" 같은 직접적 CTA 금지!

═══════════════════════════════════
[필수 공식] 바이럴 영상 분석 결과
═══════════════════════════════════

★ 대본 구조 (15-20초, 50-70자):

[후킹 1-2초] 
- 스크롤 멈추게 하는 첫 문장
- 유형: 공포/발견/위기/감탄/도발/허세/후회/충격 중 택1
- 예: "친구 집 갔는데 거울에서 갑자기 소리가..."

[상황 5초]
- 문제 상황 또는 발견 순간
- "알고 보니까...", "근데 이게..."

[신박 포인트 10초]
- 제품의 가장 신박한 점 "딱 하나만"
- 기능 나열 금지! 임팩트 있는 것 하나만!

[마무리 3초]
- 궁금증 폭발시키고 끝
- "근데 이게...", "실화임", "ㄹㅇ 개꿀"
- 절대 답 주지 마! 알아서 링크 찾게!

★ 말투 (바이럴 영상 공통점):
- 친구한테 카톡하는 느낌
- 반말 + 감탄사 필수 (와, 헐, 대박, 미쳤다, ㄹㅇ)
- 속닥거리듯 / 흥분해서 / 다급하게
- "~거든요", "~잖아요" 자연스럽게

★ 심리 기법 (분석된 패턴):
1. 피해망상: "이거 없으면 ~당해요"
2. 계급장: "부자들은", "전문가가"  
3. 남의집: "친구네/시누이네 갔다가"
4. 반전: "A인 줄 알았는데 B"
5. FOMO: "나만 몰랐나?"

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
