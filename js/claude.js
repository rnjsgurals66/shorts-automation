// Claude API 연동
// Vercel Serverless Function 호출

/**
 * Claude API로 대본 생성
 * @param {string} topic - 뉴스 주제
 * @param {string} mode - 'satire' 또는 'coupang'
 * @returns {Promise<string>} - 생성된 대본
 */
async function generateScript(topic, mode = 'satire') {
    try {
        const response = await fetch('/api/claude', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                mode: mode
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.script;

    } catch (error) {
        console.error('Claude API 오류:', error);
        throw error;
    }
}
