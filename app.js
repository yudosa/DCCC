const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const realtimeDb = require('./realtime-database');

// 프로그램명에 맞는 이미지 반환 함수
function getProgramImage(programTitle) {
    const title = programTitle.toLowerCase();
    
    // 베이킹 관련
    if (title.includes('베이킹') || title.includes('쿠킹') || title.includes('요리')) {
        return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop&crop=center';
    }
    
    // 미술/아트 관련
    if (title.includes('아트') || title.includes('미술') || title.includes('그림') || title.includes('살롱')) {
        return 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center';
    }
    
    // 청소년 활동 관련
    if (title.includes('청소년') || title.includes('청.사.진') || title.includes('활동') || title.includes('체험')) {
        return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop&crop=center';
    }
    
    // 교육/학습 관련
    if (title.includes('교육') || title.includes('학습') || title.includes('수업') || title.includes('교실')) {
        return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&crop=center';
    }
    
    // 문화/예술 관련
    if (title.includes('문화') || title.includes('예술') || title.includes('공연') || title.includes('전시')) {
        return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop&crop=center';
    }
    
    // 스포츠/운동 관련
    if (title.includes('스포츠') || title.includes('운동') || title.includes('체육') || title.includes('놀이')) {
        return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center';
    }
    
    // 과학/기술 관련
    if (title.includes('과학') || title.includes('기술') || title.includes('로봇') || title.includes('코딩')) {
        return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop&crop=center';
    }
    
    // 독서/문학 관련
    if (title.includes('독서') || title.includes('문학') || title.includes('책') || title.includes('도서')) {
        return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center';
    }
    
    // 기본 이미지 (청소년 활동)
    return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop&crop=center';
}

// 예약 관련 라우트 가져오기
const reservationRoutes = require('./routes/reservations');

const app = express();
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
            return callback(null, true);
        }
        
        // 프로덕션 환경에서는 클라우드타입 도메인과 특정 도메인만 허용
        const allowedOrigins = [
            'https://*.cloudtype.app',
            'https://*.cloudtype.io',
            'https://your-domain.vercel.app',
            'https://your-domain.netlify.app',
            'https://your-domain.com'
        ];
        
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin.includes('*')) {
                const pattern = allowedOrigin.replace('*', '.*');
                return new RegExp(pattern).test(origin);
            }
            return allowedOrigin === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('CORS 정책에 의해 차단되었습니다.'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// 미들웨어 설정
app.use(cors(corsOptions)); // CORS 설정 적용
app.use(bodyParser.json()); // JSON 데이터 파싱
app.use(bodyParser.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// 정적 파일 제공 (HTML, CSS, JS 파일들)
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.use('/api/reservations', reservationRoutes);

// 기본 라우트 - 예약 페이지 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 용인시청소년미래재단 프로그램 정보 API (간소화된 버전)
app.get('/api/programs', async (req, res) => {
    try {
        console.log('프로그램 정보 로딩 중...');
        
        // 기본 프로그램 데이터 (스크래핑 없이 정적 데이터 사용)
        const programs = [
            {
                title: "수지청소년문화의집 수지맞은 베이킹교실 4차 활동",
                image: getProgramImage("수지청소년문화의집 수지맞은 베이킹교실 4차 활동"),
                applicationPeriod: "2025-07-23 ~ 2025-08-01",
                participationPeriod: "2025-08-02 ~ 2025-08-30",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "수지청소년문화의집 수지맞은 베이킹교실 3차 활동",
                image: getProgramImage("수지청소년문화의집 수지맞은 베이킹교실 3차 활동"),
                applicationPeriod: "2025-06-19 ~ 2025-07-04",
                participationPeriod: "2025-07-05 ~ 2025-07-26",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "유림청소년문화의집 청소년이 배우는 역사의 진실 청.사.진 활동공유",
                image: getProgramImage("유림청소년문화의집 청소년이 배우는 역사의 진실 청.사.진 활동공유"),
                applicationPeriod: "2025-08-30 ~ 2025-09-13",
                participationPeriod: "2025-08-30 ~ 2025-09-13",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "처인성어울림센터 아트살롱 1회차 활동",
                image: getProgramImage("처인성어울림센터 아트살롱 1회차 활동"),
                applicationPeriod: "2025-08-12 ~ 2025-08-19",
                participationPeriod: "2025-09-06 ~ 2025-09-06",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "용인시청소년미래재단 동천청소년문화의집 개관식 사전접수",
                image: getProgramImage("용인시청소년미래재단 동천청소년문화의집 개관식 사전접수"),
                applicationPeriod: "2025-09-04 ~ 2025-09-24",
                participationPeriod: "2025-09-29 ~ 2025-09-29",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "용인시청소년미래재단 동천청소년문화의집 청소년 운영위원회 1기 모집",
                image: getProgramImage("용인시청소년미래재단 동천청소년문화의집 청소년 운영위원회 1기 모집"),
                applicationPeriod: "2025-09-09 ~ 2025-09-17",
                participationPeriod: "2025-10-01 ~ 2025-12-31",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "청소년수련관 욕구조사 결과 공유",
                image: getProgramImage("청소년수련관 욕구조사 결과 공유"),
                applicationPeriod: "2025-09-08 ~ 2025-09-25",
                participationPeriod: "2025-09-08 ~ 2025-09-25",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "꿈드림 2025년 나+너=드림 멘토 모집 안내",
                image: getProgramImage("꿈드림 2025년 나+너=드림 멘토 모집 안내"),
                applicationPeriod: "2025-09-08 ~ 마감시까지",
                participationPeriod: "",
                link: "https://www.yiyf.or.kr"
            }
        ];
        
        console.log(`${programs.length}개 프로그램 정보 로딩 완료`);
        res.json(programs);
        
    } catch (error) {
        console.error('프로그램 로딩 오류:', error);
        
        // 오류 시 기본 데이터 반환
        const fallbackPrograms = [
            {
                title: "수지청소년문화의집 '수지맞은 베이킹교실 4차' 활동",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop&crop=center",
                applicationPeriod: "2025-07-23 ~ 2025-08-01",
                participationPeriod: "2025-08-02 ~ 2025-08-30",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "수지청소년문화의집 '수지맞은 베이킹교실 3차' 활동",
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=200&fit=crop&crop=center",
                applicationPeriod: "2025-06-19 ~ 2025-07-04",
                participationPeriod: "2025-07-05 ~ 2025-07-26",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "유림청소년문화의집 청소년이 배우는 역사의 진실 '청.사.진' 활동공유",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center",
                applicationPeriod: "2025-08-30 ~ 2025-09-13",
                participationPeriod: "2025-08-30 ~ 2025-09-13",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "처인성어울림센터 아트살롱 1회차 활동",
                image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center",
                applicationPeriod: "2025-08-12 ~ 2025-08-19",
                participationPeriod: "2025-09-06 ~ 2025-09-06",
                link: "https://www.yiyf.or.kr"
            }
        ];
        
        res.json(fallbackPrograms);
    }
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

        // 클라우드타입 환경에서의 graceful shutdown
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
    .catch((err) => {
        console.error('❌ 서버 시작 실패:', err);
        process.exit(1);
    });
    