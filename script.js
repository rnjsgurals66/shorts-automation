// ========== 1. API 호출 도구 (전화기) ==========
window.generatedVideos = {}; // 영상 주소 저장소

async function callAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `서버 에러: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API 에러:', error);
        throw error;
    }
}

// ========== 2. AI 뇌 (GPT & 성우) ==========

// GPT에게 대본 요청 (미나의 뇌)
async function generateScript(topic, mode) {
    console.log(`🧠 GPT에게 요청 중: ${topic} (${mode})`);
    const data = await callAPI('/api/openai', {
        method: 'POST',
        body: { productInfo: topic, videoUrl: mode }
    });
    return data.script;
}

// 성우에게 목소리 요청 (일레븐랩스)
async function generateVoice(text) {
    console.log(`🎤 성우 녹음 시작...`);
    const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error('음성 생성 실패');

    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

// ========== 3. UI 화면 조작 기능 ==========

function selectMode(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    if (mode === 'satire') document.getElementById('satireMode').style.display = 'block';
    if (mode === 'coupang') document.getElementById('coupangMode').style.display = 'block';
}

// ========== 4. 풍자 쇼츠 공장 가동 ==========

async function startSatireAutomation() {
    const startBtn = document.getElementById('satirStartBtn');
    const statusDiv = document.getElementById('satirStatus');
    const progressDiv = document.getElementById('satirProgress');
    const resultsDiv = document.getElementById('satirResults');
    
    startBtn.disabled = true;
    startBtn.textContent = '⏳ 제작 중...';
    progressDiv.textContent = '🐶 풍자 쇼츠 제작 시작!\n';
    
    try {
        const topic = "최근 가장 핫한 사회 이슈"; // 주제
        
        // 1. 대본
        progressDiv.textContent += `🧠 아이디어 구상 중...\n`;
        const script = await generateScript(topic, 'satire');
        progressDiv.textContent += `📝 대본 완료!\n`;

        // 2. 음성
        progressDiv.textContent += `🎤 녹음 중...\n`;
        const audioUrl = await generateVoice(script);
        
        // 3. 영상 (이미지 필수)
        progressDiv.textContent += `🎬 영상 편집 중...\n`;
        const satireImage = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1080&q=80"; // 강아지 사진

        const videoResponse = await callAPI('/api/video', {
            method: 'POST',
            body: { script, audioUrl, productImage: satireImage, mode: 'satire' }
        });

        if (videoResponse.success) {
            progressDiv.textContent += `✅ 완성!\n`;
            window.generatedVideos['satire_1'] = videoResponse.url;
            addVideoResult(1, resultsDiv, 'satire');
        }

        statusDiv.textContent = '🎉 제작 성공!';
        statusDiv.style.background = '#d4edda';
    } catch (error) {
        progressDiv.textContent += `❌ 실패: ${error.message}`;
        statusDiv.textContent = '오류 발생';
        statusDiv.style.background = '#f8d7da';
    } finally {
        startBtn.disabled = false;
        startBtn.textContent = '🚀 다시 만들기';
    }
}

// ========== 5. 쿠팡 쇼츠 공장 가동 ==========

async function startCoupangAutomation() {
    const startBtn = document.getElementById('coupangStartBtn');
    const statusDiv = document.getElementById('coupangStatus');
    const progressDiv = document.getElementById('coupangProgress');
    const resultsDiv = document.getElementById('coupangResults');
    const videoCount = parseInt(document.getElementById('coupangVideoCount').value) || 1;
    
    startBtn.disabled = true;
    startBtn.textContent = '⏳ 제작 중...';
    progressDiv.textContent = '🛍️ 쿠팡 쇼츠 제작 시작!\n';
    
    try {
        for(let i=1; i<=videoCount; i++) {
            progressDiv.textContent += `\n[영상 ${i}] 작업 시작...\n`;
            
            // 1. 대본
            const script = await generateScript(`쿠팡 대박 상품 ${i}`, 'coupang');
            progressDiv.textContent += `📝 대본 작성 완료\n`;
            
            // 2. 음성
            const audioUrl = await generateVoice(script);
            progressDiv.textContent += `🎤 성우 녹음 완료\n`;
            
            // 3. 영상 (이미지 필수)
            const sampleImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=80"; // 상품 사진
            
            const videoResponse = await callAPI('/api/video', {
                method: 'POST',
                body: { script, audioUrl, productImage: sampleImage, mode: 'coupang' }
            });

            if (videoResponse.success) {
                progressDiv.textContent += `✅ 영상 ${i} 완성!\n`;
                window.generatedVideos[`coupang_${i}`] = videoResponse.url;
                addVideoResult(i, resultsDiv, 'coupang');
            }
        }
        statusDiv.textContent = '🎉 모든 작업 완료!';
        statusDiv.style.background = '#d4edda';
    } catch (error) {
        progressDiv.textContent += `❌ 오류: ${error.message}`;
    } finally {
        startBtn.disabled = false;
        startBtn.textContent = '🚀 다시 만들기';
    }
}

// ========== 6. 결과창 및 다운로드 ==========

function addVideoResult(index, resultsDiv, mode) {
    const url = window.generatedVideos[`${mode}_${index}`];
    const div = document.createElement('div');
    div.innerHTML = `
        <div style="margin-top:10px; padding:10px; background:#f0f0f0; border-radius:5px;">
            <strong>${mode === 'satire' ? '풍자' : '쿠팡'} 영상 #${index}</strong>
            <button onclick="window.open('${url}', '_blank')" style="margin-left:10px; cursor:pointer;">
                ⬇️ 영상 보기
            </button>
        </div>
    `;
    resultsDiv.appendChild(div);
}

// ========== 7. [필수] 버튼 연결 (전선 작업) ==========
// ★ 이 부분이 맨 아래에 있어야 합니다!
document.addEventListener('DOMContentLoaded', () => {
    console.log("🔌 버튼 연결 중...");
    
    // 풍자 버튼 연결
    const sBtn = document.getElementById('satirStartBtn');
    if (sBtn) sBtn.addEventListener('click', startSatireAutomation);

    // 쿠팡 버튼 연결
    const cBtn = document.getElementById('coupangStartBtn');
    if (cBtn) cBtn.addEventListener('click', startCoupangAutomation);

    // 카드(메뉴) 클릭 연결
    const sCard = document.querySelector('.card-satire'); // 클래스명 확인 필요
    const cCard = document.querySelector('.card-coupang');
    
    // 만약 HTML에 onclick="selectMode(...)"가 있다면 아래 두 줄은 없어도 되지만, 안전하게 넣어둠
    if(sCard) sCard.addEventListener('click', () => selectMode('satire'));
    if(cCard) cCard.addEventListener('click', () => selectMode('coupang'));
    
    console.log("✅ 모든 버튼 연결 완료!");
});
