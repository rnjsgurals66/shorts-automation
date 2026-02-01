import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [시스템 강제 업데이트 모드]
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (확인됨)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log("📢 [강제 적용] 핫핑크 화면 생성 시도!");

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
                    duration: 3, 
                    elements: [
                        // 1. 배경: 이번엔 강렬한 ★핫핑크(#ff007f)★
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#ff007f' 
                        },
                        // 2. 텍스트: 성공 확인 메시지
                        {
                            type: 'text',
                            track: 2,
                            text: "사장님! 핑크색 떴습니다!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', font_size: '70px', text_align: 'center'
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
