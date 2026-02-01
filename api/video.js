import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 기본 통신 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (확인됨)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log("📢 [최종] 기본 MP3 재생 테스트");

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
                    // 에러 원인이었던 metadata 삭제함
                    elements: [
                        // 1. 배경: 파란색 (#0000ff) - 색깔 바뀌면 성공
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#0000ff' 
                        },
                        // 2. 자막
                        {
                            type: 'text',
                            track: 2,
                            text: "소리 확인용 (파란화면)",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', font_size: '60px'
                        },
                        // 3. 오디오: 데모 음악 파일 강제 재생
                        {
                            type: 'audio',
                            track: 3,
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
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
