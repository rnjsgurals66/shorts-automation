
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [시스템 재가동] 통신 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (확인 완료)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log("📢 [안전모드] 외부 파일 없는 순수 영상 생성...");

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
                    // 외부 파일(음악, 이미지) 전부 제거 -> 오류 원인 차단
                    duration: 3, // 3초짜리 가벼운 영상
                    elements: [
                        // 1. 배경: 파란색 (#0000ff)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#0000ff' 
                        },
                        // 2. 텍스트: 성공 확인 메시지
                        {
                            type: 'text',
                            track: 2,
                            text: "공장 재가동 성공!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', font_size: '80px', text_align: 'center'
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
        console.log("✅ 생성 완료:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 에러:", error);
        res.status(500).json({ error: error.message });
    }
}
