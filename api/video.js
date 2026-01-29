// Vercel Serverless Function - Creatomate 영상 생성 API
export default async function handler(req, res) {
    // 1. CORS 허용 (기본 설정)
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
        // ★ 핵심 수정 1: 프론트에서 보낸 'productImage'를 여기서 받습니다!
        const { script, audioUrl, productImage } = req.body;

        const apiKey = process.env.CREATOMATE_API_KEY;
        // 키는 아까 사진에서 확인했으니 여기선 불러오기만 하면 됩니다.
        if (!apiKey) {
            return res.status(500).json({ error: 'Creatomate API 키가 없습니다.' });
        }

        console.log("영상 생성 시작! 이미지 주소:", productImage);

        // 2. Creatomate에 영상 만들어달라고 명령
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
                duration: audioUrl ? null : 10, // 오디오 길이에 맞춤
                source: {
                    elements: [
                        // (1) 배경 (깔끔한 흰색/회색 톤)
                        {
                            type: 'shape',
                            track: 1,
                            width: '100%',
                            height: '100%',
                            fill_color: '#f5f5f5'
                        },
                        // (2) ★ 핵심 수정 2: 제품 이미지 추가 (줌인 효과)
                        {
                            type: 'image',
                            track: 2,
                            // 이미지가 없으면 빈칸 방지용 대체 이미지
                            source: productImage || 'https://via.placeholder.com/1080x1920?text=No+Image', 
                            width: '100%',
                            height: '100%',
                            fit: 'cover', // 화면 꽉 차게
                            animations: [
                                {
                                    time: '0s',
                                    duration: '100%',
                                    type: 'scale', // 줌인 애니메이션
                                    start_scale: '100%',
                                    end_scale: '110%',
                                    easing: 'linear'
                                }
                            ]
                        },
                        // (3) 자막 (스타일 업그레이드)
                        {
                            type: 'text',
                            track: 3,
                            text: script ? script.substring(0, 100) : "...", // 너무 길면 자름
                            font_family: 'Noto Sans KR', // 한글 폰트
                            font_weight: '700',
                            font_size: '6 vmin',
                            fill_color: '#ffffff',
                            stroke_color: '#000000', // 검은 테두리 (잘 보이게)
                            stroke_width: '1.5 vmin',
                            y: '75%', // 화면 하단에 배치
                            width: '90%',
                            text_align: 'center',
                            background_color: 'rgba(0,0,0,0.3)', // 글자 뒤에 반투명 배경
                            background_padding: '2 vmin'
                        },
                        // (4) 오디오 (성우 목소리)
                        ...(audioUrl ? [{
                            type: 'audio',
                            track: 4,
                            source: audioUrl,
                            duration: null 
                        }] : [])
                    ]
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Creatomate 에러:', errorText);
            return res.status(500).json({ error: '영상 생성 실패', details: errorText });
        }

        const data = await response.json();
        console.log("생성 완료 URL:", data[0]?.url);

        return res.status(200).json({
            success: true,
            url: data[0]?.url,
            id: data[0]?.id
        });

    } catch (error) {
        console.error('서버 오류:', error);
        return res.status(500).json({ error: '서버 내부 오류' });
    }
}
