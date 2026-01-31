// api/video.js (최종 완성: 쇼핑몰 영상 생성용)
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. 기본 통신 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
        // [여기에 키를 넣으세요] 아까 성공했던 그 키를 그대로 넣으세요!
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e'; 
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        if (!apiKey || apiKey.includes('여기에')) {
             throw new Error('API 키를 코드에 직접 넣어주세요!');
        }

        // 프론트엔드에서 보낸 데이터 받기 (상품 이미지, 대본)
        const { script, productImage } = req.body;
        
        // 이미지가 없을 경우를 대비한 기본 이미지
        const finalImage = productImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1080&q=80';

        console.log("🎬 쇼핑몰 영상 제작 시작...");

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
                        // 1. 배경 (상품 이미지로 꽉 채우기)
                        {
                            type: 'image',
                            track: 1,
                            source: finalImage,
                            width: '100%', height: '100%',
                            fit: 'cover',
                            // 살짝 커지는 애니메이션 (고급스러움 추가)
                            animations: [
                                { time: '0s', duration: '100%', type: 'scale', start_scale: '100%', end_scale: '110%' }
                            ]
                        },
                        // 2. 어두운 필터 (글씨 잘 보이게)
                        {
                            type: 'shape',
                            track: 2,
                            width: '100%', height: '100%',
                            fill_color: 'rgba(0,0,0,0.4)'
                        },
                        // 3. 자막 (상품 설명)
                        {
                            type: 'text',
                            track: 3,
                            text: script || "이 상품 정말 대박이네요! 지금 바로 확인하세요.",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            background_color: 'rgba(0,0,0,0.6)', // 글자 배경
                            y: '65%', width: '90%',
                            font_size: '55px', text_align: 'center',
                            font_weight: '700'
                        },
                        // 4. AI 성우 (OpenAI 연결됨)
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'openai', 
                            voice: 'alloy', // 남성톤 (shimmer나 nova로 변경 가능)
                            text: script || "안녕하세요! 오늘은 정말 특별한 상품을 가져왔습니다."
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
        console.log("✅ 영상 생성 완료:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 에러 발생:", error);
        res.status(500).json({ error: error.message });
    }
}
