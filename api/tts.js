// api/tts.js
import { ElevenLabsClient } from "elevenlabs";

// ▼ 아래 따옴표 안에 일레븐랩스에서 복사한 '여자 성우 ID'를 넣으세요!
const VOICE_ID = "YOUR_FEMALE_VOICE_ID_HERE"; 

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) return res.status(400).json({ error: '대본이 없습니다.' });

  // ★ [미나의 청소기] 괄호, 시간표시, 지문 강제 삭제
  const cleanText = text
    .replace(/\[.*?\]/g, "") // [0-2초] 삭제
    .replace(/\(.*?\)/g, "") // (웃음) 삭제
    .replace(/[0-9]+초/g, "") // 00초 삭제
    .replace(/(후킹|본문|마무리|오프닝)[:：]/g, "") // 분류표 삭제
    .replace(/[\r\n]+/g, " ") // 줄바꿈 정리
    .trim();

  try {
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    // 스트림 방식으로 음성 생성
    const audioStream = await client.generate({
      voice: VOICE_ID,
      text: cleanText,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.8 }
    });

    // 오디오 데이터를 버퍼로 변환하여 전송
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(buffer);

  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: '음성 생성 실패' });
  }
}
