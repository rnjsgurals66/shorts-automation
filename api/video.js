import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [시스템 가동] 쇼핑몰 영상 제작 엔진
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (연결 확인됨)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        // 프론트엔드에서 보낸 데이터 (상품 이미지, 대본)
        const { script, productImage } = req.body;
        
        // 이미지가 없을 때를 대비한 비상용 이미지
        const fallbackImage = 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1080&q=80';
        
        // 대본이 없을 때 할 멘트
        const finalScript = script || "사장님! 드디어 성공입니다. 일레븐랩스 목소리와 상품이 아주 잘 보입니다!";

        console.log("🎬 [최종] 쇼핑몰 영상 생성 요청 (일레븐랩스 + 쿠팡이미지)");

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
                    // ★핵심: 목소리 길이에 맞춰서 영상 시간 자동 조절
                    duration: 'auto', 
                    elements: [
                        // 1. 배경 (상품 이미지로 꽉 채우기)
                        {
                            type: 'image',
                            track: 1,
                            // 쿠팡 이미지가 있으면 그거 쓰고, 없으면 비상용 이미지
                            source: productImage || fallbackImage,
                            width: '100%', height: '100%',
                            fit: 'cover',
                            // 살짝 커지는 고급 애니메이션
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
                        // 3. 자막 (흰색 글씨)
                        {
                            type: 'text',
                            track: 3,
                            text: finalScript,
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '65%', width: '90%',
                            font_size: '50px', text_align: 'center',
                            font_weight: '700'
                        },
                        // 4. ★성우: 일레븐랩스 (Adam)★
                        // (Creatomate 설정에 저장된 키를 자동으로 씁니다)
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'elevenlabs', 
                            voice: 'pNInz6obpgDQGcFmaJgB', // 남성 목소리
                            text: finalScript
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
        console.log("✅ 영상 완료 URL:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 에러:", error);
        res.status(500).json({ error: error.message });
    }
}
