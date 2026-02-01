import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 통신 기본 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (제가 미리 넣어뒀습니다. 수정하지 마세요!)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log("🔥 [테스트] 빨간 화면 강제 출력 모드...");

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
                    // ★ 오디오 없이 딱 5초만 재생 (오류 원인 제거)
                    duration: 5, 
                    elements: [
                        // 1. 배경: 눈에 확 띄는 ★빨간색(#ff0000)★
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#ff0000' 
                        },
                        // 2. 자막: 빨간색이 보이면 성공입니다
                        {
                            type: 'text',
                            track: 2,
                            text: "사장님! 빨간색 보이면 연결 성공입니다!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', width: '90%',
                            font_size: '60px', text_align: 'center'
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
