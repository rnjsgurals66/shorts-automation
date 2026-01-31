// api/video.js (실패 없는 OpenAI 성우 버전)
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. 기본 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { script, productImage } = req.body;
        const apiKey = process.env.CREATOMATE_API_KEY;

        if (!apiKey) throw new Error('Creatomate API 키가 없습니다.');
        
        console.log("🎬 영상 렌더링 요청 (OpenAI Nova 성우)...");

        // 이미지 없으면 기본 이미지
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
                    // ★핵심: duration을 null로 두면 '목소리 길이'만큼 영상이 만들어짐
                    duration: null, 
                    elements: [
                        // 1. 배경 (진한 남색)
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
                            text: script || "안녕하세요! 대박 상품입니다.",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            background_color: 'rgba(0,0,0,0.6)',
                            y: '75%', width: '90%',
                            font_size: '52px', text_align: 'center'
                        },
                        // 4. ★ 핵심 변경: 무조건 되는 OpenAI 성우 사용 ★
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'openai',  // 일레븐랩스 대신 OpenAI 사용
                            voice: 'nova',       // 한국어 발음이 좋은 여성 성우
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
