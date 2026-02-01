import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. [백지화] 통신 환경 초기화
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 2. [자원 확보] 사장님 자산(Key) 직접 연결
        // Creatomate 키 (사장님 계정)
        const creatomateKey = 'd0a0112c94b744f3b7575628b4c0f62bf51fb6082e2bc9c77896f187dd70aa61481116ce5dccaf2316ca97ec6c7e106e';
        // ElevenLabs 키 (사장님 계정)
        const elevenLabsKey = 'sk_c4788a0537d188af3fd51311235df0980d250989aeacc674';

        const { script, productImage } = req.body;
        
        // 3. [안전장치] 데이터가 없으면 기본값으로 대체하여 에러 방지
        const safeImage = productImage || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1080&q=80';
        const safeScript = script || "사장님! 이제 모든 게 완벽하게 작동합니다. 돈 버실 일만 남았습니다!";

        console.log("🚀 [시스템 재구축] 쇼핑몰 영상 생성 시작 (All-in-One Mode)");

        const response = await fetch('https://api.creatomate.com/v1/renders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${creatomateKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                output_format: 'mp4',
                width: 1080,
                height: 1920,
                source: {
                    // ★ 핵심: 'auto'로 두면 성우 목소리 길이에 맞춰 영상이 늘어남
                    duration: 'auto', 
                    elements: [
                        // [Layer 1] 배경: 상품 이미지
                        {
                            type: 'image',
                            track: 1,
                            source: safeImage,
                            width: '100%', height: '100%',
                            fit: 'cover',
                            // 고급스러운 줌인 효과
                            animations: [
                                { time: '0s', duration: '100%', type: 'scale', start_scale: '100%', end_scale: '110%' }
                            ]
                        },
                        // [Layer 2] 필터: 글자 잘 보이게 어둡게 처리
                        {
                            type: 'shape',
                            track: 2,
                            width: '100%', height: '100%',
                            fill_color: 'rgba(0,0,0,0.3)' 
                        },
                        // [Layer 3] 자막: 흰색 큰 글씨
                        {
                            type: 'text',
                            track: 3,
                            text: safeScript,
                            font_family: 'Noto Sans KR',
                            fill_color: '#ffffff',
                            background_color: 'rgba(0,0,0,0.5)',
                            y: '70%', width: '90%',
                            font_size: '52px', text_align: 'center',
                            font_weight: '700'
                        },
                        // [Layer 4] 성우: ElevenLabs 연결 (Key 직접 주입으로 에러 차단)
                        {
                            type: 'audio',
                            track: 4,
                            provider: 'elevenlabs',
                            // 사장님이 가진 키를 여기서 강제로 사용하게 설정
                            custom_integration_id: null, 
                            key: elevenLabsKey, 
                            voice: 'pNInz6obpgDQGcFmaJgB', // Adam (남성)
                            text: safeScript
                        },
                        // [Layer 5] 배경음악: 분위기 살리는 BGM (볼륨 20%로 은은하게)
                        {
                            type: 'audio',
                            track: 5,
                            source: 'https://creatomate-static.s3.amazonaws.com/demo/music.mp3',
                            duration: 'auto', // 영상 끝날 때까지 재생
                            volume: 20, // 성우 목소리 방해 안 되게 낮춤
                            audio_fade_out: 2 // 끝날 때 부드럽게
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
        console.log("✅ 최종 결과물:", data[0].url);
        res.status(200).json({ success: true, url: data[0].url });

    } catch (error) {
        console.error("❌ 비상 상황:", error);
        res.status(500).json({ error: error.message });
    }
}
