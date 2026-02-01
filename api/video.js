import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [시스템 초기화]
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 Creatomate 키 (확인됨)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log("🎵 [긴급] 외부 MP3 파일 강제 주입 시도...");

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
                    duration: 5, // 5초 재생
                    elements: [
                        // 1. 배경: 노란색 (화면 바뀐 거 확인용)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#ffff00' 
                        },
                        // 2. 자막
                        {
                            type: 'text',
                            track: 2,
                            text: "음악 소리 테스트 (AI 아님)",
                            font_family: 'Noto Sans KR',
                            fill_color: '#000000',
                            y: '50%', font_size: '60px'
                        },
                        // 3. ★오디오: AI 성우 다 끄고, 실제 MP3 파일 직접 재생★
                        {
                            type: 'audio',
                            track: 3,
                            // Creatomate에서 제공하는 데모 음악 파일 (저작권 문제 없음)
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
        console.log("✅ MP3 영상 완료:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 에러:", error);
        res.status(500).json({ error: error.message });
    }
}
