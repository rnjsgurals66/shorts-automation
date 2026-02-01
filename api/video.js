import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [시스템 복구] 오디오 제거 버전
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';
        const { script, productImage } = req.body;
        
        // 상품 이미지가 없으면 핑크색 배경 (성공 확인용)
        const safeImage = productImage; 
        const finalScript = script || "화면이 보이면 성공입니다! (무음)";

        console.log("🚀 [무음 테스트] 이미지 렌더링 시작...");

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
                    duration: 5, // 5초 고정
                    elements: [
                        // 1. 배경: 상품 이미지가 있으면 이미지, 없으면 핑크색(#ff007f)
                        {
                            type: safeImage ? 'image' : 'shape',
                            track: 1,
                            source: safeImage, // 이미지가 있으면 url 사용
                            fill_color: '#ff007f', // 이미지가 없으면 핑크색
                            width: '100%', height: '100%',
                            fit: 'cover'
                        },
                        // 2. 자막
                        {
                            type: 'text',
                            track: 2,
                            text: finalScript,
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            background_color: 'rgba(0,0,0,0.5)',
                            y: '50%', width: '90%',
                            font_size: '60px', text_align: 'center'
                        }
                    ]
                    // ★ 오디오 트랙을 아예 제거했습니다. (에러 원인 차단)
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Creatomate 에러: ${errText}`);
        }

        const data = await response.json();
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
