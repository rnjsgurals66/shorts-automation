import crypto from 'crypto';

// Vercel Serverless Function - ElevenLabs TTS API + Cloudinary 업로드
// 23개 바이럴 영상 분석 기반 음성 설정

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
    // text 또는 script 둘 다 받을 수 있게
    const { text, script, voice, mode } = req.body;
    const inputText = text || script;

    if (!inputText) {
      return res.status(400).json({ error: 'text 또는 script가 필요합니다' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    // ═══════════════════════════════════════════════════
    // 한국어 음성 ID (혁민 ElevenLabs 계정)
    // ═══════════════════════════════════════════════════
    
    const koreanVoiceId = 'Ir7oQcBXWiq4oFGROCfj';
    const voiceId = koreanVoiceId;

    // ═══════════════════════════════════════════════════
    // 바이럴 영상 분석 기반 음성 파라미터
    // ═══════════════════════════════════════════════════
    
    const voiceSettings = {
      stability: 0.4,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true
    };

    // ElevenLabs TTS 호출
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: inputText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings
        })
      }
    );

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      return res.status(500).json({ error: 'TTS 생성 실패', details: error });
    }

    // 오디오를 base64로 변환
    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Cloudinary에 업로드
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !cloudApiKey || !cloudApiSecret) {
      return res.status(200).json({
        success: true,
        audioUrl: audioDataUrl,
        voiceUsed: 'korean'
      });
    }

    // Cloudinary 업로드
    const timestamp = Math.round(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${cloudApiSecret}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.append('file', audioDataUrl);
    formData.append('timestamp', timestamp);
    formData.append('api_key', cloudApiKey);
    formData.append('signature', signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const uploadData = await uploadResponse.json();

    if (uploadData.error) {
      return res.status(200).json({
        success: true,
        audioUrl: audioDataUrl,
        voiceUsed: 'korean'
      });
    }

    return res.status(200).json({
      success: true,
      audioUrl: uploadData.secure_url,
      voiceUsed: 'korean'
    });

  } catch (error) {
    console.error('TTS 오류:', error);
    return res.status(500).json({ error: '서버 오류', message: error.message });
  }
}
