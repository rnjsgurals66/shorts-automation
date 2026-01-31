// api/video.js (강제 소환 모드)
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. 기본 보안 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const apiKey = process.env.CREATOMATE_API_KEY;
        if (!apiKey) throw new Error('Creatomate API 키가 없습니다.');

        console.log("🧪 테스트: 강제로 이미지와 대본을 주입합니다.");

        // 2. 영상 공장 호출
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
                    // ★ 핵심: 외부에서 뭘 받든 무시하고, 여기서 직접 지정함 ★
                    elements: [
                        // (1) 배경: 핫핑크색 (검은색이면 안됨!)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#ff007f' 
                        },
                        // (2) 글자: 강제 출력
                        {
                            type: 'text',
                            track: 2,
                            text: "오디오 테스트 중입니다!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', font_size: '60px'
                        },
                        // (3) 목소리: OpenAI (사장님 결제 확인됨!)
                        {
                            type: 'audio',
                            track: 3,
                            provider: 'openai', 
                            voice: 'alloy',
                            text: "사장님, 들리시나요? 결제는 잘 되어 있습니다. 이제 소리가 나올 겁니다."
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
        console.log("✅ 주소 생성:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
