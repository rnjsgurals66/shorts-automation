// Claude API 연동
// API 키는 나중에 환경변수로 관리

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Claude API로 대본 생성
 * @param {string} topic - 뉴스 주제
 * @param {string} mode - 'satire' 또는 'coupang'
 * @returns {Promise<string>} - 생성된 대본
 */
async function generateScript(topic, mode = 'satire') {
    // API 키 확인 (브라우저에서는 보안상 서버 필요!)
    const apiKey = 'YOUR_API_KEY_HERE'; // 나중에 환경변수로
    
    try {
        let prompt = '';
        
        if (mode === 'satire') {
            // 풍자 쇼츠 대본
            prompt = `
다음 뉴스를 바탕으로 60초 분량의 풍자 쇼츠 대본을 작성해주세요.

뉴스: ${topic}

형식:
- 할아버지 강아지와 손자 강아지의 대화
- 재치있고 위트있는 사회 풍자
- 60초 분량 (약 150-200자)
- 할아버지: [대사]
- 손자: [대사]

대본:
            `;
        } else if (mode === 'coupang') {
            // 쿠팡 쇼츠 대본
            prompt = `
다음 상품에 대한 60초 분량의 쿠팡 쇼츠 대본을 작성해주세요.

상품 정보: ${topic}

요구사항:
- 시청자의 호기심을 자극하는 첫 3초
- 상품의 핵심 기능과 장점 강조
- 구매 욕구를 자극하는 표현
- 60초 분량 (약 150-200자)

대본:
            `;
        }
        
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Claude API 오류: ${response.status}`);
        }
        
        const data = await response.json();
        const script = data.content[0].text;
        
        return script;
        
    } catch (error) {
        console.error('Claude API 호출 실패:', error);
        throw error;
    }
}

/**
 * 테스트 함수
 */
async function testClaudeAPI() {
    try {
        const script = await generateScript('최근 AI 발전에 대한 뉴스', 'satire');
        console.log('생성된 대본:', script);
        return script;
    } catch (error) {
        console.error('테스트 실패:', error);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateScript, testClaudeAPI };
}
