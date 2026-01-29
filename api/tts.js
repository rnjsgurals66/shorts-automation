// Vercel Serverless Function - ElevenLabs TTS (Fetch 방식)
import fetch from 'node-fetch'; // 튼튼한 배달부 소환

export default async function handler(req, res) {
    // 1. 기본 설정 (CORS 허용)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { text } = req.body;
        const apiKey = process.env.ELEVENLABS_API_KEY;

        // ▼▼▼ [사장님! 여기에 성우 ID를 넣으세요] ▼▼▼
        // 따옴표("")는 지우지 마시고 글자만 바꾸세요!
        // 예시: const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; 
        const VOICE_ID = " 6Vgh4FaCc0SCcWPwcyXa"; 

        if (!apiKey) throw new Error('ElevenLabs API 키가 없습니다.');
        if (!text) throw new Error('변환할 대본이 없습니다.');
        if (VOICE_ID === "여기에_성우_ID_붙여넣기") {
             throw new Error('사장님! tts.js 파일에서 성우 ID를 수정해주세요!');
        }

        console.log(`🎤 목소리 생성 시작 (ID: ${VOICE_ID})`);

        // 2. 일레븐랩스에 직접 전화 걸기 (SDK 대신 Fetch 사용)
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2", // 한국어 잘하는 모델
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 일레븐랩스 에러:', errorText);
            throw new Error(`성우 연결 실패: ${errorText}`);
        }

        // 3. 음성 파일 받아서 전달
        const audioBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ error: error.message });
    }
}
