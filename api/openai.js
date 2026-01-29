// api/openai.js
import OpenAI from 'openai';

export default async function handler(req, res) {
    // 기본 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { productInfo } = req.body;
        
        // 키 확인
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API 키가 없습니다.');
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // 프롬프트: 무조건 짧고 굵게!
        const prompt = `
        너는 쇼츠 마케팅 전문가야. 
        "${productInfo}"에 대한 30초짜리 흥미진진한 대본을 작성해.
        
        [규칙]
        1. 첫 문장은 무조건 시선을 끄는 "어그로"성 멘트로 시작해.
        2. 전체 길이는 절대 150자를 넘지 마. (영상 길이 제한 때문)
        3. 이모지, 해시태그, 지문((웃음) 등) 절대 넣지 마. 오직 읽을 대사만 써.
        4. 반말(친구에게 말하듯이)로 작성해.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
            model: "gpt-4o", // 혹은 gpt-3.5-turbo
        });

        const script = completion.choices[0].message.content.trim();
        console.log("✅ GPT 대본 완성:", script);

        res.status(200).json({ script });

    } catch (error) {
        console.error("❌ OpenAI 에러:", error);
        res.status(500).json({ error: error.message || '대본 생성 실패' });
    }
}
