import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. 기본 통신 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (수정하지 마세요!)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        const { script, productImage } = req.body;
        
        // 이미지가 없을 때를 대비한 기본 이미지
        const fallbackImage = 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1080&q=80';
        
        // 대본이 없을 때 나오는 멘트
        const finalScript = script || "사장님! 드디어 성공입니다. 일레븐랩스 목소리가 아주 잘 들리시죠?";

        console.log("🎬 [최종] 일레븐랩스 쇼핑몰 영상 제작 중...");

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
                    duration: 'auto', 
                    elements: [
                        // 1. 배경 (상품 이미지 없으면 분홍색)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#ff007f' 
                        },
                        // 2. 상품 이미지 (쿠팡 사진)
                        {
                            type: 'image',
                            track: 2,
                            source: productImage || fallbackImage,
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
                            text: finalScript,
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            background_color: 'rgba(0,0,0,0.7)',
                            y: '70%', width: '90%',
                            font_size: '50px', text_align: 'center'
                        },
                        // 4. ★성우: 일레븐랩스 (Adam)★
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'elevenlabs', 
                            voice: 'pNInz6obpgDQGcFmaJgB', // Adam (남성 목소리)
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
        console.log("✅ 완료 URL:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 에러 발생:", error);
        res.status(500).json({ error: error.message });
    }
}
