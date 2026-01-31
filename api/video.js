import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (그대로 두세요!)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log("🚀 [테스트] 초록색 화면 & 일레븐랩스 강제 호출 중...");

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
                        // 1. 배경: 눈에 확 띄는 ★초록색(#00ff00)★
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#00ff00' 
                        },
                        // 2. 자막: 무조건 이 멘트가 나와야 함
                        {
                            type: 'text',
                            track: 2,
                            text: "사장님! 초록색 떴습니다! 업데이트 성공!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#000000',
                            y: '50%', width: '90%',
                            font_size: '60px', text_align: 'center'
                        },
                        // 3. 성우: 일레븐랩스 (Adam)
                        {
                            type: 'audio',
                            track: 3,
                            provider: 'elevenlabs', 
                            voice: 'pNInz6obpgDQGcFmaJgB',
                            text: "사장님, 이제 진짜 된 겁니다. 초록색 화면이 보이시죠?"
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
