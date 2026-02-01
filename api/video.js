import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [시스템 가동] 음악 쇼핑몰 영상
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (정상 작동 확인됨)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        const { script, productImage } = req.body;
        
        // 상품 이미지가 없으면 기본 이미지(커피 사진) 사용
        const safeImage = productImage || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1080&q=80';
        const finalScript = script || "사장님! 드디어 영상과 음악이 함께 나옵니다!";

        console.log("📢 [안전모드] 배경음악 + 상품영상 제작 시작...");

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
                    duration: 5, // 딱 5초 깔끔하게
                    elements: [
                        // 1. 배경 이미지 (상품 사진)
                        {
                            type: 'image',
                            track: 1,
                            source: safeImage,
                            width: '100%', height: '100%',
                            fit: 'cover',
                            // 살짝 움직이는 효과 (고급스럽게)
                            animations: [
                                { time: '0s', duration: '100%', type: 'scale', start_scale: '100%', end_scale: '110%' }
                            ]
                        },
                        // 2. 글자 배경 (검게 처리해서 글자 잘 보이게)
                        {
                            type: 'shape',
                            track: 2,
                            width: '100%', height: '100%',
                            fill_color: 'rgba(0,0,0,0.5)' 
                        },
                        // 3. 자막
                        {
                            type: 'text',
                            track: 3,
                            text: finalScript,
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', width: '80%',
                            font_size: '60px', text_align: 'center',
                            font_weight: '700'
                        },
                        // 4. ★핵심★: 안전한 공식 배경음악 (BGM)
                        {
                            type: 'audio',
                            track: 4,
                            // Creatomate 공식 데모 음악 (에러 없음)
                            source: 'https://creatomate-static.s3.amazonaws.com/demo/music.mp3',
                            duration: 5,
                            volume: 100
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
        console.log("✅ 완료:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
