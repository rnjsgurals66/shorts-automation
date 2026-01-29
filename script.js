// script.js (전면 수정본)
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 시스템 준비 완료");

    // 버튼 연결
    const satireBtn = document.getElementById('satirStartBtn');
    if (satireBtn) satireBtn.addEventListener('click', () => startProcess('satire'));

    const coupangBtn = document.getElementById('coupangStartBtn');
    if (coupangBtn) coupangBtn.addEventListener('click', () => startProcess('coupang'));
});

// 공통 실행 함수
async function startProcess(mode) {
    const progressDiv = mode === 'satire' ? document.getElementById('satirProgress') : document.getElementById('coupangProgress');
    const resultsDiv = mode === 'satire' ? document.getElementById('satirResults') : document.getElementById('coupangResults');
    const startBtn = mode === 'satire' ? document.getElementById('satirStartBtn') : document.getElementById('coupangStartBtn');

    // 1. 초기화
    startBtn.disabled = true;
    startBtn.textContent = "⏳ 진행 중...";
    progressDiv.textContent = "🚀 작업을 시작합니다...\n";
    resultsDiv.innerHTML = ""; // 결과창 비우기

    try {
        const topic = "요즘 핫한 이슈"; // 혹은 입력값 가져오기

        // 2. [OpenAI] 대본 작성
        progressDiv.textContent += "🧠 1단계: GPT가 대본 쓰는 중...\n";
        const scriptRes = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productInfo: topic })
        });
        
        if (!scriptRes.ok) throw new Error(`OpenAI 오류: ${scriptRes.status}`);
        const { script } = await scriptRes.json();
        if (!script) throw new Error("대본이 비어있습니다.");
        progressDiv.textContent += `✅ 대본 완료: "${script.substring(0, 20)}..."\n`;


        // 3. [TTS] 목소리 녹음
        progressDiv.textContent += "🎤 2단계: 성우 녹음 중...\n";
        const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: script })
        });

        if (!ttsRes.ok) throw new Error(`TTS 오류: ${ttsRes.status}`);
        
        // 오디오 파일을 데이터(Blob)로 변환
        const audioBlob = await ttsRes.blob();
        // Creatomate에 보낼 수 있게 Base64 문자열로 변환 (중요!)
        const audioBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(audioBlob);
        });
        progressDiv.textContent += "✅ 목소리 파일 변환 완료!\n";


        // 4. [Video] 영상 제작
        progressDiv.textContent += "🎬 3단계: 영상 편집기 가동...\n";
        // 테스트용 이미지 (실제로는 DALL-E 이미지나 상품 이미지 사용)
        const sampleImage = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1080&q=80";

        const videoRes = await fetch('/api/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                script: script,
                audioUrl: audioBase64, // 녹음된 파일 전송
                productImage: sampleImage
            })
        });

        if (!videoRes.ok) throw new Error(`영상 API 오류: ${videoRes.status}`);
        const videoData = await videoRes.json();

        if (videoData.success && videoData.url) {
            progressDiv.textContent += "🎉 모든 작업 성공!\n";
            
            // 결과 버튼 생성
            const resultHTML = `
                <div style="margin-top: 15px; padding: 15px; background: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px;">
                    <p><strong>✅ 영상이 완성되었습니다!</strong></p>
                    <p style="font-size: 12px; color: #666;">(버튼을 누르고 하얀 화면이 나오면 F5를 눌러주세요)</p>
                    <button onclick="window.open('${videoData.url}', '_blank')" 
                        style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        🎬 영상 보러 가기 (클릭)
                    </button>
                </div>
            `;
            resultsDiv.innerHTML = resultHTML;
        } else {
            throw new Error("영상 주소를 받지 못했습니다.");
        }

    } catch (error) {
        console.error(error);
        progressDiv.textContent += `\n❌ [치명적 오류 발생] ❌\n${error.message}\n`;
        alert("작업 중 오류가 발생했습니다. 로그를 확인해주세요.");
    } finally {
        startBtn.disabled = false;
        startBtn.textContent = "🚀 다시 시작";
    }
}
