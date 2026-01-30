// script.js (성우 단계 건너뛰기 버전)

// 1. 화면 전환 기능
function selectMode(mode) {
    const selectionScreen = document.getElementById('modeSelection');
    const satireScreen = document.getElementById('satireMode');
    const coupangScreen = document.getElementById('coupangMode');

    if (selectionScreen) selectionScreen.style.display = 'none';
    if (mode === 'satire' && satireScreen) satireScreen.style.display = 'block';
    if (mode === 'coupang' && coupangScreen) coupangScreen.style.display = 'block';
}
window.selectMode = selectMode;

// 2. 공장 가동
async function startProcess(mode) {
    const progressDiv = mode === 'satire' ? document.getElementById('satirProgress') : document.getElementById('coupangProgress');
    const resultsDiv = mode === 'satire' ? document.getElementById('satirResults') : document.getElementById('coupangResults');
    const startBtn = mode === 'satire' ? document.getElementById('satirStartBtn') : document.getElementById('coupangStartBtn');

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

        // (2) 성우 단계 생략 (영상 공장에서 직접 함)
        progressDiv.textContent += "⏩ 2단계: 성우 녹음 생략 (영상 내장 성우 사용)\n";

        // (3) 영상 제작
        progressDiv.textContent += "🎬 3단계: 영상 편집기 가동...\n";
        const sampleImage = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&q=80";

        const videoRes = await fetch('/api/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                script: script,
                // audioUrl 보낼 필요 없음!
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
                    <p style="font-size:12px; color:gray; margin-top:5px;">(하얀 화면 뜨면 10초 뒤 F5 눌러주세요)</p>
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

// 3. 버튼 연결
document.addEventListener('DOMContentLoaded', () => {
    const satireCard = document.querySelector('.card-satire');
    const coupangCard = document.querySelector('.card-coupang');
    if (satireCard) satireCard.addEventListener('click', () => selectMode('satire'));
    if (coupangCard) coupangCard.addEventListener('click', () => selectMode('coupang'));

    const sBtn = document.getElementById('satirStartBtn');
    if (sBtn) sBtn.addEventListener('click', () => startProcess('satire'));
    
    const cBtn = document.getElementById('coupangStartBtn');
    if (cBtn) cBtn.addEventListener('click', () => startProcess('coupang'));
});
