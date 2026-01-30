// api/video.js (한국어 패치 완료 버전)
import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { script, productImage } = req.body;
        const apiKey = process.env.CREATOMATE_API_KEY;

        // ▼▼▼ 사장님의 일레븐랩스 성우 ID (그대로 두세요) ▼▼▼
        const VOICE_ID = "6Vgh4FaCcOSCcwPwcyXa"; 

        if (!apiKey) throw new Error('Creatomate API 키가 없습니다.');
        
        console.log("🎬 영상 렌더링 요청 (한국어 설정 적용)...");

        const safeImage = productImage || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1080&q=80';

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
                source: {
                    // ★핵심: 영상 길이를 '자동'으로 설정 (목소리 끝날 때까지)
                    duration: null, 
                    elements: [
                        // 1. 배경
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#1a1a2e' 
                        },
                        // 2. 이미지
                        {
                            type: 'image',
                            track: 2,
                            source: safeImage,
                            width: '100%', height: '100%',
                            fit: 'cover',
                            animations: [
                                { time: '0s', duration: '100%', type: 'scale', start_scale: '100%', end_scale: '110%' }
                            ]
                        },
                        // 3. 자막
                        {
                            type: 'text',
                            track: 3,
                            text: script || "대본 없음",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            background_color: 'rgba(0,0,0,0.6)',
                            y: '75%', width: '90%',
                            font_size: '52px', text_align: 'center'
                        },
                        // 4. ★ 핵심 수정: 한국어 모드 켜기 ★
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'elevenlabs',
                            voice: VOICE_ID,
                            // ▼▼▼ 이 줄이 없어서 소리가 안 났던 겁니다! ▼▼▼
                            model: 'eleven_multilingual_v2', 
                            text: script
                        }
                    ]
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Creatomate 에러: ${errText}`);
        }

        const data = await response.json();
        console.log("✅ 영상 렌더링 주소 확보:", data[0].url);

        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error('❌ 영상 생성 실패:', error);
        res.status(500).json({ error: error.message });
    }
}
