import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (수정 X)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        // ★캐시 방지용 랜덤 숫자 (매번 새로운 영상 만들게 강제함)★
        const randomID = Math.random().toString(36).substring(7);

        console.log("🎵 [테스트] 강제 음악 재생 모드...");

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
                    output_format: 'mp4',
                    // 랜덤 태그를 달아서 무조건 새로 만들게 함
                    metadata: { test_id: randomID },
                    elements: [
                        // 1. 배경: 시원한 하늘색
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#00bfff' 
                        },
                        // 2. 자막
                        {
                            type: 'text',
                            track: 2,
                            text: "사장님! 음악 소리 들리시나요? (캐시 삭제됨)",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', width: '90%',
                            font_size: '60px', text_align: 'center'
                        },
                        // 3. ★오디오: 실제 MP3 파일 강제 재생★
                        {
                            type: 'audio',
                            track: 3,
                            // 무료 효과음 (성우 아님, 그냥 소리 파일)
                            source: 'https://creatomate-static.s3.amazonaws.com/demo/music.mp3',
                            duration: 5, // 5초간 재생
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
