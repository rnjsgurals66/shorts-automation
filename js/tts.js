// TTS (Text-to-Speech) 음성 생성 - ElevenLabs API 연동

/**
 * 텍스트를 음성으로 변환
 * @param {string} text - 변환할 텍스트
 * @param {string} voice - 음성 타입 (예: '할아버지', '손자')
 * @returns {Promise<string>} - 생성된 음성 파일 URL
 */
async function generateVoice(text, voice = '기본') {
    try {
        console.log('음성 생성:', { text, voice });

        // Vercel API 호출
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, voice })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '음성 생성 실패');
        }

        const data = await response.json();
        return data.audioUrl;

    } catch (error) {
        console.error('음성 생성 실패:', error);
        throw error;
    }
}

/**
 * 지연 함수
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 여러 대사의 음성을 순차적으로 생성
 * @param {Array} dialogues - 대사 배열 [{character: '할아버지', text: '...'}, ...]
 * @returns {Promise<Array>} - 생성된 음성 URL 배열
 */
async function generateMultipleVoices(dialogues) {
    const audioUrls = [];
    
    for (const dialogue of dialogues) {
        const voice = dialogue.character || '기본';
        const audioUrl = await generateVoice(dialogue.text, voice);
        audioUrls.push({
            character: dialogue.character,
            text: dialogue.text,
            audioUrl: audioUrl
        });
        
        // API 호출 간 딜레이 (rate limit 방지)
        await delay(500);
    }
    
    return audioUrls;
}
