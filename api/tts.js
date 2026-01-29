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
    const { text, voice, mode } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text가 필요합니다' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
    }

    // ═══════════════════════════════════════════════════
    // 23개 바이럴 영상 분석 기반 음성 설정
    // ═══════════════════════════════════════════════════
    
    // 음성 ID 설정 (ElevenLabs 한국어 음성)
    // 분석 결과: 남녀 비율 5:5, 다양한 톤 필요
    const voiceIds = {
      // 남성 음성
      '남성_활기': 'pqHfZKP75CvOlQy1NhV4',      // 사투리, 장난기 (벤토야키 스타일)
      '남성_차분': 'jBpfuIE2acCO8z3wKNL1',      // 신뢰감, 정보전달 (와인쿨러 스타일)
      '남성_감탄': 'pqHfZKP75CvOlQy1NhV4',      // 텐션 높음 (천재발언 스타일)
      '남성_다급': 'jBpfuIE2acCO8z3wKNL1',      // 위기상황 (재산날릴뻔 스타일)
      
      // 여성 음성  
      '여성_밝음': 'EXAVITQu4vr4xnSDxMaL',      // 경쾌함 (스마트테이블 스타일)
      '여성_속닥': 'EXAVITQu4vr4xnSDxMaL',      // 비밀공유 (스타일리스트 스타일)
      '여성_억울': 'EXAVITQu4vr4xnSDxMaL',      // 며느리톤 (시어머니 스타일)
      '여성_흥분': 'EXAVITQu4vr4xnSDxMaL',      // 발견기쁨 (드디어찾았다 스타일)
      
      // 기본값
      '기본': 'pqHfZKP75CvOlQy1NhV4'
    };

    // 음성 스타일 랜덤 또는 지정
    let selectedVoice = voice || '기본';
    
    // mode에 따라 적절한 음성 자동 선택
    if (!voice) {
      if (mode === 'satire') {
        // 풍자 쇼츠: 캐릭터별 다른 음성 필요하지만 일단 활기찬 남성
        selectedVoice = '남성_활기';
      } else {
        // 쿠팡 쇼츠: 랜덤하게 다양한 스타일
        const coupangVoices = ['남성_감탄', '남성_다급', '여성_밝음', '여성_속닥', '여성_흥분'];
        selectedVoice = coupangVoices[Math.floor(Math.random() * coupangVoices.length)];
      }
    }

    const voiceId = voiceIds[selectedVoice] || voiceIds['기본'];

    // ═══════════════════════════════════════════════════
    // 바이럴 영상 분석 기반 음성 파라미터
    // ═══════════════════════════════════════════════════
    // 분석 결과:
    // - 빠르고 에너지 있는 말투
    // - 감정 표현이 풍부함
    // - 너무 차분하면 이탈률 증가
    
    const voiceSettings = {
      stability: 0.3,           // 낮을수록 감정적, 역동적 (기본 0.5 → 0.3으로 조정)
      similarity_boost: 0.8,    // 음색 유지
      style: 0.5,               // 스타일 강도
      use_speaker_boost: true   // 선명도 향상
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
          text: text,
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
      // Cloudinary 설정 없으면 base64로 반환
      return res.status(200).json({
        success: true,
        audioUrl: audioDataUrl,
        voiceUsed: selectedVoice
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
      // 업로드 실패시 base64로 반환
      return res.status(200).json({
        success: true,
        audioUrl: audioDataUrl,
        voiceUsed: selectedVoice
      });
    }

    return res.status(200).json({
      success: true,
      audioUrl: uploadData.secure_url,
      voiceUsed: selectedVoice
    });

  } catch (error) {
    console.error('TTS 오류:', error);
    return res.status(500).json({ error: '서버 오류', message: error.message });
  }
}
