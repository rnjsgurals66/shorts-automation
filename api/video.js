// api/video.js (키 직접 주입 버전)
import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // ▼▼▼▼▼▼ 여기가 핵심입니다! ▼▼▼▼▼▼
        // process.env... 이거 다 필요 없고, 따옴표('') 안에 아까 복사한 긴 키를 붙여넣으세요.
        const apiKey = '여기에_복사한_키를_붙여넣으세요'; 
        // 예시: const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e'; (양쪽 따옴표 필수!)

        if (!apiKey || apiKey === '여기에_복사한_키를_붙여넣으세요') {
             throw new Error('코드를 수정해서 키를 따옴표 안에 넣어주세요!');
        }
        
        console.log("🧪 강제 키 주입 모드 실행 중...");

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
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#ff007f' // 핫핑크 배경
                        },
                        {
                            type: 'text',
                            track: 2,
                            text: "드디어 성공입니다!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', font_size: '60px'
                        },
                        {
                            type: 'audio',
                            track: 3,
                            provider: 'openai', 
                            voice: 'alloy',
                            text: "사장님, 이제 진짜 됩니다. Vercel 설정 무시하고 키를 강제로 넣었거든요."
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
