import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님, 여기 건드리지 마세요! Vercel 금고에서 알아서 꺼내옵니다.
        const apiKey = process.env.CREATOMATE_API_KEY;

        if (!apiKey) {
            throw new Error('Vercel 환경변수에 키가 없습니다.');
        }

        console.log("🚀 V3: 환경변수 키 로딩 성공!");

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
                            text: "사장님! 이제 진짜 됩니다!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', font_size: '60px'
                        },
                        {
                            type: 'audio',
                            track: 3,
                            provider: 'openai', 
                            voice: 'alloy',
                            text: "사장님, 오래 기다리셨습니다. 코드를 원상 복구하고 새 키를 연결했습니다."
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
        console.log("✅ 성공 주소:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
