// api/tts.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { text } = req.body;
        const apiKey = process.env.ELEVENLABS_API_KEY;
        
        // ▼▼▼ 여기에 ID 넣으세요! (공백 있어도 제가 자동으로 자릅니다) ▼▼▼
        let VOICE_ID = "6Vgh4FaCc0SCcWPwcyXa"; 
        VOICE_ID = VOICE_ID.trim(); // 공백 자동 제거 안전장치

        if (!apiKey) throw new Error('ElevenLabs API 키가 없습니다.');
        if (!text) throw new Error('변환할 대본이 없습니다.');

        console.log(`🎤 성우에게 요청 중... (ID: ${VOICE_ID}, 텍스트: ${text.substring(0, 10)}...)`);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
        });

        if (!response.ok) {
            const errorDetail = await response.text();
            console.error('❌ 성우 연결 실패:', errorDetail);
            throw new Error(`ElevenLabs 에러: ${errorDetail}`);
        }

        const audioBuffer = await response.arrayBuffer();
        console.log("✅ 목소리 파일 생성 완료!");

        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('❌ TTS 서버 에러:', error);
        res.status(500).json({ error: error.message });
    }
}
