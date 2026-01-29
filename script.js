// ========== API 연동 준비 ==========
// 생성된 영상 URL 저장용 (다운로드 버튼을 위해 필수)
window.generatedVideos = {};

// API 호출 헬퍼 함수 (기본 도구)
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
            throw new Error(errorData.error || `API 호출 실패: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
}

// ========== [핵심] AI 기능 함수 (여기가 진짜 엔진입니다!) ==========

// 1. GPT에게 대본 요청하기 (이제 Claude 아님!)
async function generateScript(topic, mode) {
    // api/openai.js가 받는 변수명(productInfo, videoUrl)에 맞춰서 데이터 전송
    const data = await callAPI('/api/openai', {
        method: 'POST',
        body: { 
            productInfo: topic, 
            videoUrl: mode // 'satire' 또는 'coupang' 모드 전달
        }
    });
    return data.script;
}

// 2. TTS 음성 생성하기 (일레븐랩스)
async function generateVoice(text) {
    const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error('음성 생성 실패');

    // 받아온 음성 파일(Blob)을 크리에이토메이트가 쓸 수 있게 URL로 변환
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Data URL 반환
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ========== UI 조작 함수 ==========

// 모드 선택 화면 전환
function selectMode(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    
    if (mode === 'satire') {
        document.getElementById('satireMode').style.display = 'block';
    } else if (mode === 'coupang') {
        document.getElementById('coupangMode').style.display = 'block';
    }
}

// 초기 화면으로 돌아가기
function backToModeSelection() {
    document.getElementById('modeSelection').style.display = 'block';
    document.getElementById('satireMode').style.display = 'none';
    document.getElementById('coupangMode').style.display = 'none';
}

// ========== 1. 풍자 쇼츠 모드 로직 ==========

async function startSatireAutomation() {
    const videoCount = parseInt(document.getElementById('satirVideoCount').value) || 1;
    const startBtn = document.getElementById('satirStartBtn');
    const statusDiv = document.getElementById('satirStatus');
    const progressDiv = document.getElementById('satirProgress');
    const resultsDiv = document.getElementById('satirResults');
    
    // 버튼 잠그기 (중복 클릭 방지)
    startBtn.disabled = true;
    startBtn.textContent = '⏳ 미나가 일하는 중...';
    
    // 상태창 초기화
    statusDiv.textContent = '작업 진행 중...';
    statusDiv.className = 'status-box working'; // CSS 스타일 적용 필요 시
    statusDiv.style.background = '#fff3cd';
    statusDiv.style.color = '#856404';
    
    progressDiv.textContent = '🐶 풍자 쇼츠 공장 가동!\n';
    resultsDiv.innerHTML = '';
    
    try {
        for (let i = 1; i <= videoCount; i++) {
            await createSatireVideo(i, progressDiv, resultsDiv);
        }
        
        // 완료 표시
        statusDiv.textContent = '✅ 모든 풍자 영상 제작 완료!';
        statusDiv.style.background = '#d4edda';
        statusDiv.style.color = '#155724';
        
        startBtn.textContent = '🎉 완료!';
        setTimeout(() => {
            startBtn.disabled = false;
            startBtn.textContent = '🚀 풍자 영상 제작 시작!';
        }, 3000);
        
    } catch (error) {
        statusDiv.textContent = '❌ 오류 발생!';
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.color = '#721c24';
        progressDiv.textContent += `\n⛔ 치명적 오류: ${error.message}`;
        startBtn.disabled = false;
        startBtn.textContent = '🚀 다시 시작하기';
    }
}

async function createSatireVideo(index, progressDiv, resultsDiv) {
    const topics = ['최근 정치 이슈', '경제 동향 뉴스', '사회 문제'];
    const topic = topics[(index - 1) % topics.length]; // 토픽 순환
    
    progressDiv.textContent += `\n🎬 [영상 ${index}] 주제: ${topic} 시작...\n`;
    
    try {
        // 1. GPT 대본 생성 (Real API)
        progressDiv.textContent += `  🧠 GPT가 대본 쓰는 중...\n`;
        const script = await generateScript(topic, 'satire');
        progressDiv.textContent += `  📝 대본 완료! (길이: ${script.length}자)\n`;
        
        // 2. TTS 음성 생성 (Real API)
        progressDiv.textContent += `  🎤 성우가 녹음 중...\n`;
        const audioUrl = await generateVoice(script);
        progressDiv.textContent += `  🔊 녹음 완료!\n`;
        
        // 3. 영상 합성 (Creatomate Real API)
        progressDiv.textContent += `  🎞️ 영상 편집 및 렌더링 중...\n`;
        
        // ★ 중요: 풍자 영상용 기본 이미지 (없으면 에러나서 임시로 넣음)
        // 나중에 사장님이 DALL-E로 생성한 이미지 URL을 여기에 넣으면 됨
        const satireImage = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1080&q=80"; 

        const videoResponse = await callAPI('/api/video', {
            method: 'POST',
            body: { 
                script, 
                audioUrl, 
                productImage: satireImage, // 이미지 필수!
                mode: 'satire' 
            }
        });

        if (videoResponse.success && videoResponse.url) {
            progressDiv.textContent += `  ✅ 영상 ${index} 제작 성공!\n`;
            // URL 저장
            window.generatedVideos[`satire_${index}`] = videoResponse.url;
            addVideoResult(index, resultsDiv, 'satire');
        } else {
            throw new Error('영상 URL을 받아오지 못했습니다.');
        }
        
    } catch (error) {
        progressDiv.textContent += `  ❌ 실패: ${error.message}\n`;
        console.error(error);
        // 하나 실패해도 다음 거 진행하도록 throw 안 함 (선택사항)
    }
}

// ========== 2. 쿠팡 쇼츠 모드 로직 ==========

async function startCoupangAutomation() {
    const tiktokUrl = document.getElementById('tiktokUrl').value;
    const videoCount = parseInt(document.getElementById('coupangVideoCount').value) || 1;
    const startBtn = document.getElementById('coupangStartBtn');
    const statusDiv = document.getElementById('coupangStatus');
    const progressDiv = document.getElementById('coupangProgress');
    const resultsDiv = document.getElementById('coupangResults');
    
    // 버튼 잠그기
    startBtn.disabled = true;
    startBtn.textContent = '⏳ 미나가 일하는 중...';
    
    statusDiv.textContent = '작업 진행 중...';
    statusDiv.style.background = '#fff3cd';
    statusDiv.style.color = '#856404';
    
    progressDiv.textContent = '🛍️ 쿠팡 쇼츠 공장 가동!\n';
    // 틱톡 URL은 참고용으로만 표시 (실제 크롤링은 어려움)
    if(tiktokUrl) progressDiv.textContent += `🔗 참고 링크: ${tiktokUrl}\n`;
    resultsDiv.innerHTML = '';
    
    try {
        for (let i = 1; i <= videoCount; i++) {
            await createCoupangVideo(i, tiktokUrl, progressDiv, resultsDiv);
        }
        
        statusDiv.textContent = '✅ 모든 쿠팡 영상 제작 완료!';
        statusDiv.style.background = '#d4edda';
        statusDiv.style.color = '#155724';
        
        startBtn.textContent = '🎉 완료!';
        setTimeout(() => {
            startBtn.disabled = false;
            startBtn.textContent = '🚀 쿠팡 영상 제작 시작!';
        }, 3000);
        
    } catch (error) {
        statusDiv.textContent = '❌ 오류 발생!';
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.color = '#721c24';
        progressDiv.textContent += `\n⛔ 오류: ${error.message}`;
        startBtn.disabled = false;
        startBtn.textContent = '🚀 다시 시작하기';
    }
}

async function createCoupangVideo(index, tiktokUrl, progressDiv, resultsDiv) {
    const productName = `쿠팡 대박 상품 ${index}`;
    progressDiv.textContent += `\n🛍️ [영상 ${index}] 제작 시작...\n`;
    
    try {
        // 1. GPT 대본 생성
        progressDiv.textContent += `  🧠 GPT가 리뷰 대본 쓰는 중...\n`;
        const script = await generateScript(productName, 'coupang'); // 'coupang' 모드로 전달
        progressDiv.textContent += `  📝 대본 완료! (길이: ${script.length}자)\n`;
        
        // 2. TTS 음성 생성
        progressDiv.textContent += `  🎤 성우가 녹음 중...\n`;
        const audioUrl = await generateVoice(script);
        // ========== [필수] 버튼 클릭 이벤트 연결하기 ==========
// 화면이 다 로딩되면 버튼에 기능을 연결합니다.
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 풍자 쇼츠 '시작' 버튼 연결
    const satireBtn = document.getElementById('satirStartBtn');
    if (satireBtn) {
        satireBtn.addEventListener('click', startSatireAutomation);
        console.log('✅ 풍자 쇼츠 버튼 연결됨');
    }

    // 2. 쿠팡 쇼츠 '시작' 버튼 연결
    const coupangBtn = document.getElementById('coupangStartBtn');
    if (coupangBtn) {
        coupangBtn.addEventListener('click', startCoupangAutomation);
        console.log('✅ 쿠팡 쇼츠 버튼 연결됨');
    } else {
        console.error('❌ 경고: 쿠팡 시작 버튼(coupangStartBtn)을 찾을 수 없습니다. HTML ID를 확인하세요.');
    }

    // 3. (혹시 모를) 모드 선택 카드 연결 
    // 만약 메인 화면의 큰 버튼이 안 눌리는 거라면 아래 코드가 필요합니다.
    // (HTML ID가 맞는지 확인이 필요하지만, 일반적인 이름으로 넣어둘게요)
    const satireCard = document.querySelector('.card-satire'); // 또는 ID
    const coupangCard = document.querySelector('.card-coupang'); // 또는 ID
    
    if (satireCard) satireCard.addEventListener('click', () => selectMode('satire'));
    if (coupangCard) coupangCard.addEventListener('click', () => selectMode('coupang'));
});
        progressDiv.textContent += `  🔊 녹음 완료!\n`;
        
        // 3. 영상 합성
        progressDiv.textContent += `
