// Vercel Serverless Function - Creatomate 영상 생성 API
export default async function handler(req, res) {
    // 1. CORS 및 허용 메소드 설정 (기본 세팅)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. 프론트엔드에서 보낸 데이터 받기 (제품사진, 대본, 오디오URL)
        // ★중요: productImage를 받아야 화면에 띄웁니다!
        const { script, audioUrl, productImage } = req.body;

        const apiKey = process.env.CREATOMATE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Creatomate API 키가 설정되지 않았습니다' });
        }

        console.log("영상 생성 시작! 이미지:", productImage);

        // 3. Creatomate API로 "움직이는 영상" 만들기
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
                frame_rate: 30,
                // 오디오 길이가 있으면 그만큼, 없으면 10초
                duration: audioUrl ? null : 10, 
                source: {
                    elements: [
                        // (1) 배경색 (깔끔한 화이트/그레이 톤)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%',
                            height: '100%',
                            fill_color: '#f5f5f5' 
                        },
                        // (2) 제품 이미지 (가장 중요! - 줌인 효과 추가)
                        {
                            type: 'image',
                            track: 2,
                            source: productImage || 'https://via.placeholder.com/1080x1920?text=No+Image', // 이미지 없으면 빈칸 방지
                            width: '100%',
                            height: '100%',
                            fit: 'cover', // 화면 꽉 차게
                            animations: [
                                {
                                    time: '0s',
                                    duration: '100%', // 영상 내내
                                    type: 'scale', // 줌인 효과
                                    start_scale: '100%',
                                    end_scale: '110%',
                                    easing: 'linear'
                                }
                            ]
                        },
                        // (3) 자막 (대본 띄우기 - 중앙 하단)
                        {
                            type: 'text',
                            track: 3,
                            text: script ? script.substring(0, 50) : "대본 없음", // 너무 길면 자름
                            font_family: 'Noto Sans KR',
                            font_weight: '700',
                            font_size: '6 vmin', // 글자 크기
                            fill_color: '#ffffff', // 흰색 글씨
                            stroke_color: '#000000', // 검은 테두리 (가독성)
                            stroke_width: '2 vmin',
                            y: '80%', // 하단 배치
                            width: '90%',
                            text_align: 'center',
                            background_color: 'rgba(0,0,0,0.5)', // 반투명 배경 박스
                            background_padding: '2 vmin'
                        },
                        // (4) 오디오 (성우 목소리)
                        ...(audioUrl ? [{
                            type: 'audio',
                            track: 4,
                            source: audioUrl,
                            // 오디오 길이에 맞춰 영상 길이 자동 조절
                            duration: null 
                        }] : [])
                    ]
                }
            })
        });

        // 4. 결과 처리
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Creatomate 에러:', errorText);
            return res.status(500).json({ error: 'Creatomate API 오류', details: errorText });
        }

        const data = await response.json();
        console.log("영상 생성 완료 URL:", data[0]?.url);

        return res.status(200).json({
            success: true,
            renderId: data[0]?.id,
            status: data[0]?.status,
            url: data[0]?.url
        });

    } catch (error) {
        console.error('서버 내부 오류:', error);
        return res.status(500).json({ error: '서버 오류', message: error.message });
    }
}
