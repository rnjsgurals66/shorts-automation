// Cloudinary 오디오 업로드 API
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
        const { audioBase64 } = req.body;

        if (!audioBase64) {
            return res.status(400).json({ error: 'audioBase64가 필요합니다' });
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return res.status(500).json({ error: 'Cloudinary 설정이 없습니다' });
        }

        // Cloudinary에 업로드
        const timestamp = Math.round(Date.now() / 1000);
        const signature = require('crypto')
            .createHash('sha1')
            .update(`timestamp=${timestamp}${apiSecret}`)
            .digest('hex');

        const formData = new URLSearchParams();
        formData.append('file', audioBase64);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        formData.append('signature', signature);
        formData.append('resource_type', 'video');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: 'Cloudinary 업로드 실패', details: data.error });
        }

        return res.status(200).json({
            success: true,
            url: data.secure_url
        });

    } catch (error) {
        console.error('오디오 업로드 오류:', error);
        return res.status(500).json({ error: '서버 오류', message: error.message });
    }
}
