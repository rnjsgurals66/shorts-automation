// api/openai.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS 설정 (프론트엔드에서 호출 허용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productInfo, videoUrl } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `너는 쿠팡 파트너스 쇼츠 전문 대본 작가야. 
          
          [절대 규칙 - 어기면 해고]
          1. **출력 형식:** 오직 성우가 읽을 '대사'만 출력해. 
          2. **금지 사항:** [0-2초], (후킹), (웃음), "제목:", "본문:" 같은 지문이나 시간 표시를 절대 포함하지 마.
          3. **톤앤매너:** - 친구한테 말하듯이 빠르고 텐션 높은 반말을 써. (해요체 금지)
             - 문장은 짧게 끊어쳐. 호흡이 길면 지루해.
          4. **구조:**
             - 1초: 강력한 의문문이나 감탄사로 시작 (예: "와, 이거 실화야?", "아직도 호구처럼 사냐?")
             - 중간: 내 경험담처럼 스토리텔링 ("친구가 알려줬는데~")
             - 끝: 구매 유도 ("댓글 봐라", "프로필 링크 고고")`
        },
        {
          role: "user",
          content: `제품명: ${productInfo} \n참고 영상 느낌: ${videoUrl} \n이 제품으로 사고 싶게 만드는 40초짜리 쇼츠 대본 써줘.`
        }
      ],
      temperature: 0.8,
    });

    const script = completion.choices[0].message.content;
    console.log("GPT가 만든 대본:", script);

    res.status(200).json({ script });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: error.message });
  }
}
