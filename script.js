// ========== API 연동 준비 ==========

// Config 불러오기 (브라우저에서는 직접 참조)
// const CONFIG = require('./config.js'); // Node.js 환경
// 브라우저 환경에서는 config.js를 script 태그로 먼저 로드해야 함

// API 호출 헬퍼 함수
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
            throw new Error(`API 호출 실패: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
}

// ========== 기존 코드 시작 ==========// 모드 선택 함수
function selectMode(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    
    if (mode === 'satire') {
        document.getElementById('satireMode').style.display = 'block';
    } else if (mode === 'coupang') {
        document.getElementById('coupangMode').style.display = 'block';
    }
}

// 모드 선택으로 돌아가기
function backToModeSelection() {
    document.getElementById('modeSelection').style.display = 'block';
    document.getElementById('satireMode').style.display = 'none';
    document.getElementById('coupangMode').style.display = 'none';
}

// ========== 풍자 쇼츠 모드 ==========

async function startSatireAutomation() {
    const videoCount = parseInt(document.getElementById('satirVideoCount').value);
    const startBtn = document.getElementById('satirStartBtn');
    const statusDiv = document.getElementById('satirStatus');
    const progressDiv = document.getElementById('satirProgress');
    const resultsDiv = document.getElementById('satirResults');
    
    // 버튼 비활성화
    startBtn.disabled = true;
    startBtn.textContent = '⏳ 제작 중...';
    
    // 상태 업데이트
    statusDiv.textContent = '작업 진행 중...';
    statusDiv.style.background = '#fff3cd';
    statusDiv.style.borderColor = '#ffc107';
    statusDiv.style.color = '#856404';
    
    progressDiv.textContent = '🐶 풍자 쇼츠 제작을 시작합니다...\n';
    resultsDiv.innerHTML = '';
    
    try {
        for (let i = 1; i <= videoCount; i++) {
            await createSatireVideo(i, progressDiv, resultsDiv);
        }
        
        // 완료
        statusDiv.textContent = '✅ 모든 풍자 영상 제작 완료!';
        statusDiv.style.background = '#d4edda';
        statusDiv.style.borderColor = '#28a745';
        statusDiv.style.color = '#155724';
        
        startBtn.textContent = '🎉 완료!';
        
        setTimeout(() => {
            startBtn.disabled = false;
            startBtn.textContent = '🚀 풍자 영상 제작 시작!';
        }, 3000);
        
    } catch (error) {
        statusDiv.textContent = '❌ 오류 발생!';
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.borderColor = '#dc3545';
        statusDiv.style.color = '#721c24';
        
        progressDiv.textContent += `\n오류: ${error.message}`;
        
        startBtn.disabled = false;
        startBtn.textContent = '🚀 풍자 영상 제작 시작!';
    }
}

async function createSatireVideo(index, progressDiv, resultsDiv) {
    const topics = [
        '최근 정치 이슈',
        '경제 동향 뉴스',  
        '사회 문제'
    ];
    
    const topic = topics[index - 1];
    
    progressDiv.textContent += `\n\n📰 풍자 영상 ${index} 제작 시작:\n`;
    
    try {
        // 1. Claude로 대본 생성
        progressDiv.textContent += `🤖 Claude가 풍자 대본 작성 중...\n`;
        const script = await generateScript(topic, 'satire');
        progressDiv.textContent += `✅ 대본 완성: "${script.substring(0, 50)}..."\n`;
        
       // 2. TTS 음성 생성 (ElevenLabs API)
            progressDiv.textContent += `🎤 음성 생성 중...\n`;
            try {
                const audioUrl = await generateVoice(script, '할아버지');
                progressDiv.textContent += `✅ 음성 생성 완료!\n`;
            } catch (ttsError) {
                progressDiv.textContent += `⚠️ 음성 생성 실패, 시뮬레이션으로 진행\n`;
                await delay(1000);
            }
        
        progressDiv.textContent += `🎬 영상 합성 중... (시뮬레이션)\n`;
        await delay(2000);
        
        progressDiv.textContent += `✅ 영상 완성!\n`;
        
    } catch (error) {
        progressDiv.textContent += `❌ 오류: ${error.message}\n`;
        throw error;
    }

    addVideoResult(index, resultsDiv, 'satire');
}

// ========== 쿠팡 쇼츠 모드 ==========

async function startCoupangAutomation() {
    const tiktokUrl = document.getElementById('tiktokUrl').value;
    const videoStyle = document.getElementById('videoStyle').value;
    const videoCount = parseInt(document.getElementById('coupangVideoCount').value);
    const startBtn = document.getElementById('coupangStartBtn');
    const statusDiv = document.getElementById('coupangStatus');
    const progressDiv = document.getElementById('coupangProgress');
    const resultsDiv = document.getElementById('coupangResults');
    
    // URL 검증
    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
        alert('올바른 틱톡 링크를 입력해주세요!');
        return;
    }
    
    // 버튼 비활성화
    startBtn.disabled = true;
    startBtn.textContent = '⏳ 제작 중...';
    
    // 상태 업데이트
    statusDiv.textContent = '작업 진행 중...';
    statusDiv.style.background = '#fff3cd';
    statusDiv.style.borderColor = '#ffc107';
    statusDiv.style.color = '#856404';
    
    progressDiv.textContent = '🛍️ 쿠팡 쇼츠 제작을 시작합니다...\n';
    progressDiv.textContent += `📱 틱톡 링크: ${tiktokUrl}\n`;
    progressDiv.textContent += `🎨 스타일: ${getStyleName(videoStyle)}\n`;
    progressDiv.textContent += `📊 생성 개수: ${videoCount}개 (A/B 테스트)\n\n`;
    resultsDiv.innerHTML = '';
    
    try {
        for (let i = 1; i <= videoCount; i++) {
            await createCoupangVideo(i, videoStyle, progressDiv, resultsDiv);
        }
        
        // 완료
        statusDiv.textContent = '✅ 모든 쿠팡 영상 제작 완료!';
        statusDiv.style.background = '#d4edda';
        statusDiv.style.borderColor = '#28a745';
        statusDiv.style.color = '#155724';
        
        startBtn.textContent = '🎉 완료!';
        
        setTimeout(() => {
            startBtn.disabled = false;
            startBtn.textContent = '🚀 쿠팡 영상 제작 시작!';
        }, 3000);
        
    } catch (error) {
        statusDiv.textContent = '❌ 오류 발생!';
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.borderColor = '#dc3545';
        statusDiv.style.color = '#721c24';
        
        progressDiv.textContent += `\n오류: ${error.message}`;
        
        startBtn.disabled = false;
        startBtn.textContent = '🚀 쿠팡 영상 제작 시작!';
    }
}

async function createCoupangVideo(index, style, progressDiv, resultsDiv) {
    // 틱톡 URL은 UI에서 가져옴 (실제 구현 시)
    const productName = `샘플 제품 ${index}`;
    
    progressDiv.textContent += `\n\n🛍️ 비전 ${index} 제작 시작 (${getStyleName(style)}):\n`;
    
    try {
        // 1. Claude로 대본 생성
        progressDiv.textContent += `🤖 Claude가 리뷰 대본 작성 중...\n`;
        const script = await generateScript(productName, 'coupang');
        progressDiv.textContent += `✅ 대본 완성: "${script.substring(0, 50)}..."\n`;
        
       // 2. TTS 음성 생성 (ElevenLabs API)
            progressDiv.textContent += `🎤 음성 생성 중...\n`;
            try {
                const audioUrl = await generateVoice(script, '기본');
                progressDiv.textContent += `✅ 음성 생성 완료!\n`;
            } catch (ttsError) {
                progressDiv.textContent += `⚠️ 음성 생성 실패, 시뮬레이션으로 진행\n`;
                await delay(1000);
            }
        
        progressDiv.textContent += `🎬 영상 합성 중... (시뮬레이션)\n`;
        await delay(2000);
        
        progressDiv.textContent += `✅ 영상 완성!\n`;
        
    } catch (error) {
        progressDiv.textContent += `❌ 오류: ${error.message}\n`;
        throw error;
    }

    addVideoResult(index, resultsDiv, 'coupang', style);
}

// ========== 공통 함수 ==========

function addVideoResult(index, resultsDiv, mode, style = '') {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    
    const modeText = mode === 'satire' ? '풍자 쇼츠' : `쿠팡 쇼츠 (${getStyleName(style)})`;
    
    videoItem.innerHTML = `
        <div>
            <strong>${modeText} - 영상 ${index}</strong>
            <p style="margin: 5px 0 0 0; color: #666;">크기: 약 15MB | 길이: 60초</p>
        </div>
        <button class="download-btn" onclick="downloadVideo(${index}, '${mode}')">
            ⬇️ 다운로드
        </button>
    `;
    
    resultsDiv.appendChild(videoItem);
}

function downloadVideo(index, mode) {
    const modeText = mode === 'satire' ? '풍자' : '쿠팡';
    alert(`${modeText} 영상 ${index} 다운로드가 시작됩니다!\n\n(실제 구현 시 여기서 파일 다운로드가 진행됩니다)`);
}

function getStyleName(style) {
    const styles = {
        'review': '리뷰 스타일',
        'unboxing': '언박싱 스타일',
        'demo': '사용 시연 스타일',
        'comparison': '비교 분석 스타일'
    };
    return styles[style] || style;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('쇼츠 자동화 시스템 준비 완료!');
    console.log('모드: 풍자 쇼츠 + 쿠팡 쇼츠');
});
