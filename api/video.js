// api/video.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { script, productImage } = req.body; // audioUrl은 이제 안 받습니다!
        const apiKey = process.env.CREATOMATE_API_KEY;

        if (!apiKey) throw new Error('Creatomate API 키가 없습니다.');
        
        console.log("🎬 영상 렌더링 요청 (내장 성우 모드)...");

        // 이미지가 없으면 기본 이미지 사용
        const safeImage = productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1080&q=80';

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
                    elements: [
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#000000' 
                        },
                        {
                            type: 'image',
                            track: 2,
                            source: safeImage,
                            width: '100%', height: '100%',
                            fit: 'cover',
                            animations: [{ time: '0s', duration: '100%', type: 'scale', start_scale: '100%', end_scale: '110%' }]
                        },
                        {
                            type: 'text',
                            track: 3,
                            text: script || "대본 없음",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            background_color: 'rgba(0,0,0,0.5)',
                            y: '75%', width: '90%',
                            font_size: '50px', text_align: 'center'
                        },
                        // ★ 여기가 핵심 변경! (파일 전송 X -> 내부 성우 O)
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'google', // 구글 성우 사용
                            voice: 'ko-KR-Standard-A', // 한국어 여자 목소리
                            text: script // 대본을 직접 읽게 함
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
