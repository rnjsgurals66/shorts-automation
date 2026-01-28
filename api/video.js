// Vercel Serverless Function - Creatomate 영상 생성 API
export default async function handler(req, res) {
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
        const { script, audioUrl, mode } = req.body;

        if (!script) {
            return res.status(400).json({ error: 'script가 필요합니다' });
        }

        const apiKey = process.env.CREATOMATE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Creatomate API 키가 설정되지 않았습니다' });
        }

        // 배경색 설정
        const bgColor = mode === 'satire' ? '#1a1a2e' : '#4A90D9';
        const textColor = '#ffffff';

        // Creatomate API로 영상 생성
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
                duration: audioUrl ? null : 10,
                source: {
                    elements: [
                        {
                            type: 'composition',
                            track: 1,
                            elements: [
                                {
                                    type: 'shape',
                                    track: 1,
                                    shape: 'rectangle',
                                    width: '100%',
                                    height: '100%',
                                    fill_color: bgColor
                                },
                                {
                                    type: 'text',
                                    track: 2,
                                    text: script.substring(0, 300),
                                    font_family: 'Noto Sans KR',
                                    font_weight: '700',
                                    font_size: '7 vmin',
                                    fill_color: textColor,
                                    x: '50%',
                                    y: '50%',
                                    width: '80%',
                                    x_anchor: '50%',
                                    y_anchor: '50%',
                                    text_align: 'center'
                                }
                            ]
                        },
                        ...(audioUrl ? [{
                            type: 'audio',
                            track: 2,
                            source: audioUrl
                        }] : [])
                    ]
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return res.status(500).json({ error: 'Creatomate API 오류', details: error });
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            renderId: data[0]?.id,
            status: data[0]?.status,
            url: data[0]?.url
        });

    } catch (error) {
        console.error('영상 생성 오류:', error);
        return res.status(500).json({ error: '서버 오류', message: error.message });
