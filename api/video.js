// api/video.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. 보안 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { script, productImage } = req.body;
        const apiKey = process.env.CREATOMATE_API_KEY;

        if (!apiKey) throw new Error('Creatomate API 키가 없습니다.');
        
        console.log("🎬 영상 렌더링 요청 (OpenAI 성우 모드)...");

        // 이미지 안전장치 (쇼핑 관련 이미지)
        const safeImage = productImage || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1080&q=80';

        // 2. 영상 공장에 주문서 넣기
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
                        // (1) 배경색 (검은색 대신 진한 남색)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#1a1a2e' 
                        },
                        // (2) 상품 이미지
                        {
                            type: 'image',
                            track: 2,
                            source: safeImage,
                            width: '100%', height: '100%',
                            fit: 'cover', // 화면 꽉 차게
                            animations: [
                                { time: '0s', duration: '100%', type: 'scale', start_scale: '100%', end_scale: '110%' }, // 살짝 커지는 효과
                                { time: '0s', duration: '1s', type: 'fade', easing: 'linear' } // 부드럽게 등장
                            ]
                        },
                        // (3) 자막 (배경 박스 포함)
                        {
                            type: 'text',
                            track: 3,
                            text: script || "대본 없음",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff', // 흰색 글씨
                            background_color: 'rgba(0,0,0,0.6)', // 반투명 검정 박스
                            y: '75%', width: '90%',
                            font_size: '52px', text_align: 'center',
                            line_height: '1.4'
                        },
                        // (4) ★ 핵심 수정: OpenAI 성우 사용 ★
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'openai', // 공장장이 원하던 그 이름!
                            voice: 'alloy',     // 한국어도 잘하는 만능 성우
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
