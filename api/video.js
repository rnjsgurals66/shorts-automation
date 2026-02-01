import fetch from 'node-fetch';

export default async function handler(req, res) {
    // [최종 수정] 강제 업데이트를 위한 난수 생성
    const updateCheck = Math.random().toString(); 

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 사장님 키 (수정 X)
        const apiKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';

        console.log(`🎵 [시스템] 오디오 강제 재생 모드 시작 (ID: ${updateCheck})`);

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
                    // ★캐시 방지를 위해 매번 다른 메타데이터 주입★
                    metadata: { force_update: updateCheck },
                    elements: [
                        // 1. 배경: 이번엔 눈부신 ★흰색(#ffffff)★ 입니다.
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%', height: '100%',
                            fill_color: '#ffffff' 
                        },
                        // 2. 자막: 검은 글씨로 잘 보이게
                        {
                            type: 'text',
                            track: 2,
                            text: "사장님! 흰색 배경 떴나요? 음악 나옵니다!",
                            font_family: 'Noto Sans KR',
                            fill_color: '#000000',
                            y: '50%', width: '90%',
                            font_size: '60px', text_align: 'center'
                        },
                        // 3. 오디오: 저작권 없는 무료 배경음악 (MP3) 강제 재생
                        {
                            type: 'audio',
                            track: 3,
                            source: 'https://creatomate-static.s3.amazonaws.com/demo/music.mp3',
                            duration: 10, // 10초 재생
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
        console.log("✅ 생성 완료:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 에러:", error);
        res.status(500).json({ error: error.message });
    }
}
