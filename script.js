// DOM 요소
const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');
const progressDiv = document.getElementById('progress');
const resultsDiv = document.getElementById('results');
const videoCountInput = document.getElementById('videoCount');

// 버튼 클릭 이벤트
startBtn.addEventListener('click', startAutomation);

// 자동화 시작 함수
async function startAutomation() {
    const videoCount = parseInt(videoCountInput.value);
    
    // 버튼 비활성화
    startBtn.disabled = true;
    startBtn.textContent = '⏳ 제작 중...';
    
    // 상태 업데이트
    statusDiv.textContent = '작업 진행 중...';
    statusDiv.style.background = '#fff3cd';
    statusDiv.style.borderColor = '#ffc107';
    statusDiv.style.color = '#856404';
    
    progressDiv.textContent = '시작합니다...\n';
    
    try {
        // 각 영상 제작
        for (let i = 1; i <= videoCount; i++) {
            await createVideo(i);
        }
        
        // 완료
        statusDiv.textContent = '✅ 모든 영상 제작 완료!';
        statusDiv.style.background = '#d4edda';
        statusDiv.style.borderColor = '#28a745';
        statusDiv.style.color = '#155724';
        
        startBtn.textContent = '🎉 완료!';
        
        setTimeout(() => {
            startBtn.disabled = false;
            startBtn.textContent = '🚀 영상 제작 시작!';
        }, 3000);
        
    } catch (error) {
        statusDiv.textContent = '❌ 오류 발생!';
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.borderColor = '#dc3545';
        statusDiv.style.color = '#721c24';
        
        progressDiv.textContent += `\n오류: ${error.message}`;
        
        startBtn.disabled = false;
        startBtn.textContent = '🚀 영상 제작 시작!';
    }
}

// 개별 영상 제작 함수
async function createVideo(index) {
    const steps = [
        '🔍 젠스파크로 뉴스 검색 중...',
        '✍️ Claude가 대본 작성 중...',
        '🎨 캐럿 AI로 이미지 생성 중...',
        '🎤 타입캐스트로 음성 생성 중...',
        '🎬 캐럿 AI로 립싱크 영상 제작 중...',
        '🎵 자막 및 배경음악 추가 중...',
        '✅ 영상 완성!'
    ];
    
    progressDiv.textContent += `\n\n📹 영상 ${index} 제작 시작:\n`;
    
    for (const step of steps) {
        progressDiv.textContent += `${step}\n`;
        await delay(2000); // 2초 대기 (시뮬레이션)
    }
    
    // 결과에 추가
    addVideoResult(index);
}

// 완성된 영상 결과 추가
function addVideoResult(index) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
        <div>
            <strong>영상 ${index}</strong>
            <p style="margin: 5px 0 0 0; color: #666;">크기: 약 15MB | 길이: 60초</p>
        </div>
        <button class="download-btn" onclick="downloadVideo(${index})">
            ⬇️ 다운로드
        </button>
    `;
    
    resultsDiv.appendChild(videoItem);
}

// 다운로드 함수 (현재는 시뮬레이션)
function downloadVideo(index) {
    alert(`영상 ${index} 다운로드가 시작됩니다!\n\n(실제 구현 시 여기서 파일 다운로드가 진행됩니다)`);
}

// 딜레이 함수
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('쇼츠 자동화 시스템 준비 완료!');
});
