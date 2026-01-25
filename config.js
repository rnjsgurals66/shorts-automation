// API 설정 및 환경변수 관리

const CONFIG = {
    // Claude API
    CLAUDE_API_KEY: 'YOUR_CLAUDE_API_KEY',
    CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
    CLAUDE_MODEL: 'claude-sonnet-4-20250514',
    
    // TikTok API (서버에서 처리)
    TIKTOK_API_URL: '/api/tiktok/download',
    
    // 이미지 생성 API
    IMAGE_API_URL: '/api/image/generate',
    IMAGE_API_KEY: 'YOUR_IMAGE_API_KEY',
    
    // 음성 생성 API (Typecast, ElevenLabs 등)
    TTS_API_URL: '/api/tts/generate',
    TTS_API_KEY: 'YOUR_TTS_API_KEY',
    
    // 영상 생성 API
    VIDEO_API_URL: '/api/video/generate',
    VIDEO_API_KEY: 'YOUR_VIDEO_API_KEY',
    
    // 쿠팡 파트너스 API
    COUPANG_API_KEY: 'YOUR_COUPANG_API_KEY',
    COUPANG_API_SECRET: 'YOUR_COUPANG_API_SECRET',
    
    // 기본 설정
    DEFAULT_VIDEO_COUNT: 3,
    DEFAULT_VIDEO_DURATION: 60, // 초
    DEFAULT_VIDEO_STYLE: 'review',
    
    // 디버그 모드
    DEBUG: true
};

// 환경변수에서 읽기 (Vercel 등)
if (typeof process !== 'undefined' && process.env) {
    CONFIG.CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || CONFIG.CLAUDE_API_KEY;
    CONFIG.IMAGE_API_KEY = process.env.IMAGE_API_KEY || CONFIG.IMAGE_API_KEY;
    CONFIG.TTS_API_KEY = process.env.TTS_API_KEY || CONFIG.TTS_API_KEY;
    CONFIG.VIDEO_API_KEY = process.env.VIDEO_API_KEY || CONFIG.VIDEO_API_KEY;
    CONFIG.COUPANG_API_KEY = process.env.COUPANG_API_KEY || CONFIG.COUPANG_API_KEY;
    CONFIG.COUPANG_API_SECRET = process.env.COUPANG_API_SECRET || CONFIG.COUPANG_API_SECRET;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
