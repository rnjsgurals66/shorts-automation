// script.js (메뉴 이동 + 영상 제작 통합본)

// 1. [화면 전환] 메뉴 카드 누르면 화면 바뀌는 기능
function selectMode(mode) {
    console.log(`화면 전환 시도: ${mode}`);
    
    const selectionScreen = document.getElementById('modeSelection');
    const satireScreen = document.getElementById('satireMode');
    const coupangScreen = document.getElementById('coupangMode');

    // 메뉴 화면 숨기기
    if (selectionScreen) selectionScreen.style.display = 'none';

    // 선택한 화면 보여주기
    if (mode === 'satire' && satireScreen) {
        satireScreen.style.display = 'block';
    } else if (mode === 'coupang' && coupangScreen) {
        coupangScreen.style.display = 'block';
    } else {
        console.error("화면을 찾을 수 없습니다. HTML ID를 확인하세요.");
    }
}

// 혹시 HTML에 onclick="..."으로 적혀있을 경우를 대비해 전역으로 설정
window.selectMode = selectMode;


// 2. [영상 제작] 버튼 누르면 AI 공장 가동하는 기능
async function startProcess(mode) {
    const progressDiv = mode === 'satire' ? document.getElementById('satirProgress') : document.getElementById('coupangProgress');
    const resultsDiv = mode === 'satire' ? document.getElementById('satirResults') : document.getElementById('coupangResults');
    const startBtn = mode === 'satire' ? document.getElementById('satirStartBtn') : document.getElementById('coupangStartBtn');

    // 초기화
    startBtn.disabled = true;
    startBtn.textContent = "⏳ 진행 중...";
    progressDiv.textContent = "🚀 작업을 시작합니다...\n";
    resultsDiv.innerHTML = ""; 

    try {
        const topic = "요즘 핫한 이슈"; 

        // (1) OpenAI 대본
        progressDiv.textContent += "🧠 1단계: GPT가 대본 쓰는 중...\n";
        const scriptRes = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productInfo: topic })
        });
        
        if (!scriptRes.ok) throw new Error(`OpenAI 오류: ${scriptRes.status}`);
        const { script } = await scriptRes.json();
        progressDiv.textContent += `✅ 대본 완료!\n`;

        // (2) TTS 목소리
        progressDiv.textContent += "🎤 2단계: 성우 녹음 중...\n";
        const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: script })
        });

        if (!ttsRes.ok) throw new Error(`TTS 오류: ${ttsRes.status}`);
        const audioBlob = await ttsRes.blob();
        
        // 오디오 -> Base64 변환
        const audioBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(audioBlob);
        });
        progressDiv.textContent += "✅ 목소리 준비 완료!\n";

        // (3) 영상 제작
        progressDiv.textContent += "🎬 3단계: 영상 편집기 가동...\n";
        const sampleImage = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&q=80"; // 쇼핑 이미지

        const videoRes = await fetch('/api/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                script: script,
                audioUrl: audioBase64,
                productImage: sampleImage
            })
        });

        if (!videoRes.ok) throw new Error(`영상 API 오류: ${videoRes.status}`);
        const videoData = await videoRes.json();

        if (videoData.success && videoData.url) {
            progressDiv.textContent += "🎉 모든 작업 성공!\n";
            const resultHTML = `
                <div style="margin-top: 15px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                    <p><strong>✅ 영상 완성!</strong></p>
                    <button onclick="window.open('${videoData.url}', '_blank')" 
                        style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        🎬 영상 보러 가기 (클릭)
                    </button>
                    <p style="font-size:12px; color:gray; margin-top:5px;">(하얀 화면 뜨면 F5 눌러주세요)</p>
                </div>
            `;
            resultsDiv.innerHTML = resultHTML;
        }

    } catch (error) {
        console.error(error);
        progressDiv.textContent += `❌ 실패: ${error.message}`;
        alert("오류가 발생했습니다.");
    } finally {
        startBtn.disabled = false;
        startBtn.textContent = "🚀 다시 시작";
    }
}

// 3. 버튼 연결 (전선 작업)
document.addEventListener('DOMContentLoaded', () => {
    console.log("🔌 버튼 연결 시작...");

    // (1) 메뉴 카드 연결
    const satireCard = document.querySelector('.card-satire');
    const coupangCard = document.querySelector('.card-coupang');
    
    if (satireCard) satireCard.addEventListener('click', () => selectMode('satire'));
    if (coupangCard) coupangCard.addEventListener('click', () => selectMode('coupang'));

    // (2) 시작 버튼 연결
    const sBtn = document.getElementById('satirStartBtn');
    if (sBtn) sBtn.addEventListener('click', () => startProcess('satire'));
    
    const cBtn = document.getElementById('coupangStartBtn');
    if (cBtn) cBtn.addEventListener('click', () => startProcess('coupang'));
    
    console.log("✅ 모든 연결 완료!");
});
