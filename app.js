const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const realtimeDb = require('./realtime-database');

const PORT = process.env.PORT || 3000;

// 파이어베이스 Realtime Database 초기화 함수
async function initializeFirebase() {
    try {
        console.log('Firebase Realtime Database 초기화 시작...');
        
        // 기본 시설 데이터 초기화
        await realtimeDb.initializeDefaultFacilities();
        
        console.log('Firebase Realtime Database 초기화 완료');
    } catch (error) {
        console.error('Firebase Realtime Database 초기화 실패:', error.message);
        throw error;
    }
}

// CORS 설정 강화 - 클라우드타입 배포 환경 고려
const corsOptions = {
    origin: function (origin, callback) {
        // 개발 환경에서는 모든 origin 허용
        if (!origin || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            // 프로덕션 환경에서는 특정 도메인만 허용
            const allowedOrigins = [
                'https://your-domain.com',
                'https://www.your-domain.com'
            ];
            
            if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS 정책에 의해 차단되었습니다.'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const app = express();

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙 (클라우드타입 배포 환경 고려)
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true
}));

// API 라우트들
// 예약/시설 라우트는 현재 단일 페이지 앱 구조로 통합되어 있어 제거합니다.

// 루트 경로 - 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 핸들러
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: '요청한 리소스를 찾을 수 없습니다.',
        path: req.originalUrl 
    });
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
    console.error('서버 오류:', error);
    
    // CORS 오류 처리
    if (error.message.includes('CORS')) {
        return res.status(403).json({ 
            error: 'CORS 정책에 의해 요청이 차단되었습니다.',
            message: error.message 
        });
    }
    
    res.status(500).json({ 
        error: '서버 내부 오류가 발생했습니다.',
        message: process.env.NODE_ENV === 'development' ? error.message : '서버 오류'
    });
});

// 데이터베이스 초기화 후 서버 시작
initializeFirebase()
    .then(() => {
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
            console.log(`📊 환경: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 클라우드타입 배포 준비 완료`);
            console.log(`🔗 http://localhost:${PORT} 에서 확인하세요.`);
        });

        // Graceful shutdown 처리
        process.on('SIGTERM', () => {
            console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
            server.close(() => {
                console.log('서버가 정상적으로 종료되었습니다.');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
            server.close(() => {
                console.log('서버가 정상적으로 종료되었습니다.');
                process.exit(0);
            });
        });

    })
    .catch((error) => {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    });
    
module.exports = app;