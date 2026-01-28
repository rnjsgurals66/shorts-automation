// API 설정 및 환경변수 관리

const CONFIG = {
    // Claude API (서버에서 처리 - 키는 Vercel 환경변수에)
    CLAUDE_API_URL: '/api/claude',
    CLAUDE_MODEL: 'claude-sonnet-4-20250514',
    
    // TikTok API (서버에서 처리)
    TIKTOK_API_URL: '/api/tiktok/download',
    
    // 이미지 생성 API
    IMAGE_API_URL: '/api/image/generate',
    
    // 음성 생성 API (Typecast, ElevenLabs 등)
    TTS_API_URL: '/api/tts/generate',
    
    // 영상 생성 API
    VIDEO_API_URL: '/api/video/generate',
    
    // 기본 설정
    DEFAULT_VIDEO_COUNT: 3,
    DEFAULT_VIDEO_DURATION: 60,
    DEFAULT_VIDEO_STYLE: 'review',
    
    // 디버그 모드
    DEBUG: true
};
