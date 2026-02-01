import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [최종] 이미지 로딩 실패 시 "녹색 배경" 강제 적용 모드
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';
        const { script, productImage } = req.body;
        
        // 대본이 없으면 기본 멘트
        const finalScript = script || "화면이 녹색이면 성공입니다!";

        console.log("🚀 [시스템] 배경 이미지 로딩 시도 중...");

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
                    duration: 5,
                    elements: [
                        // 1. 배경: 이미지가 있으면 'image', 없거나 실패하면 'shape'(녹색)
                        {
                            type: productImage ? 'image' : 'shape',
                            track: 1,
                            // 이미지가 들어오면 그걸 쓰고, 아니면 녹색(#00ff00)을 칠해라
                            source: productImage ? productImage : undefined,
                            fill_color: '#00ff00', 
                            width: '100%', height: '100%',
                            fit: 'cover'
                        },
                        // 2. 글자 배경 (검게)
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
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
