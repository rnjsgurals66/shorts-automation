import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [초기화] 통신 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (d0a0... 로 시작하는 새 계정 키 확인 완료)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log("📢 [시스템 초기화] 오디오 트랙 강제 생성 시도 중...");

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
                    // ★중요★ 오디오가 없으면 영상이 안 만들어지게 'auto' 대신 5초 고정
                    duration: 5, 
                    elements: [
                        // 1. 배경 (검은 화면 방지용 파란색)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#0000ff' 
                        },
                        // 2. 텍스트 (시각 확인용)
                        {
                            type: 'text',
                            track: 2,
                            text: "소리 테스트 중...",
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            y: '50%', font_size: '60px'
                        },
                        // 3. 오디오 (ElevenLabs 강제 지정)
                        {
                            type: 'audio',
                            track: 3,
                            // provider가 'elevenlabs'여야 설정하신 키가 먹힙니다.
                            provider: 'elevenlabs', 
                            voice: 'pNInz6obpgDQGcFmaJgB', // Adam 목소리 ID
                            text: "사장님, 지금 목소리가 들리셔야 정상입니다. 테스트 1, 2, 3."
                        }
                    ]
                }
            })
        });

        // 에러 발생 시 상세 내용 출력
        if (!response.ok) {
            const errText = await response.text();
            console.error("❌ Creatomate 응답 에러:", errText);
            throw new Error(`Creatomate 에러: ${errText}`);
        }

        const data = await response.json();
        console.log("✅ 영상 생성 주소:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 서버 내부 에러:", error);
        res.status(500).json({ error: error.message });
    }
}
