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

// 프로그램 데이터 캐시
let programCache = {
    data: null,
    lastUpdated: null,
    cacheDuration: 5 * 60 * 1000 // 5분 캐시
};

// 용인시청소년미래재단 프로그램 정보 스크래핑 함수
async function scrapePrograms() {
    try {
        console.log('용인시청소년미래재단 프로그램 정보 스크래핑 시작...');

        // 실제 스크래핑 시도
        const scraper = new ProgramScraper();
        const scrapedPrograms = await scraper.scrapePrograms();
        
        // 스크래핑된 데이터가 있으면 사용
        if (scrapedPrograms && scrapedPrograms.length > 0) {
            console.log(`스크래핑으로 ${scrapedPrograms.length}개 프로그램 로드`);
            
            // 이미지 추가 및 데이터 정리
            const programs = scrapedPrograms.map(program => ({
                ...program,
                image: getProgramImage(program.title),
                lastUpdated: new Date().toISOString(),
                scrapedAt: program.scrapedAt || new Date().toISOString()
            }));

            // 캐시 업데이트
            programCache.data = programs;
            programCache.lastUpdated = new Date();

            console.log(`${programs.length}개 프로그램 정보 스크래핑 완료 (${new Date().toLocaleString()})`);
            return programs;
        } else {
            // 스크래핑 실패 시 수동 데이터 사용
            console.log('스크래핑 실패, 수동 데이터 사용');
            const manualData = loadPrograms();
            console.log(`수동 데이터에서 ${manualData.programs.length}개 프로그램 로드`);

            // 이미지 추가 및 데이터 정리
            const programs = manualData.programs.map(program => ({
                ...program,
                image: getProgramImage(program.title),
                lastUpdated: new Date().toISOString(),
                scrapedAt: manualData.lastUpdated
            }));

            // 캐시 업데이트
            programCache.data = programs;
            programCache.lastUpdated = new Date();

            console.log(`${programs.length}개 프로그램 정보 로드 완료 (${new Date().toLocaleString()})`);
            return programs;
        }

    } catch (error) {
        console.error('프로그램 스크래핑 오류:', error);

        // 오류 시 수동 데이터 사용
        console.log('오류 발생, 수동 데이터 사용');
        const manualData = loadPrograms();
        console.log(`수동 데이터에서 ${manualData.programs.length}개 프로그램 로드`);

        // 이미지 추가 및 데이터 정리
        const programs = manualData.programs.map(program => ({
            ...program,
            image: getProgramImage(program.title),
            lastUpdated: new Date().toISOString(),
            scrapedAt: manualData.lastUpdated
        }));

        // 캐시 업데이트
        programCache.data = programs;
        programCache.lastUpdated = new Date();

        return programs;
    }
}

// 캐시된 프로그램 데이터 가져오기
async function getCachedPrograms() {
    const now = new Date();
    
    // 캐시가 없거나 만료된 경우 새로 스크래핑
    if (!programCache.data || !programCache.lastUpdated || 
        (now - programCache.lastUpdated) > programCache.cacheDuration) {
        try {
            return await scrapePrograms();
        } catch (error) {
            console.error('새로운 데이터 스크래핑 실패, 캐시된 데이터 사용:', error);
            return programCache.data || getFallbackPrograms();
        }
    }
    
    return programCache.data;
}

// 기본 프로그램 데이터 (오류 시 사용)
function getFallbackPrograms() {
    return [
        {
            title: "수지청소년문화의집 '수지맞은 베이킹교실 4차' 활동",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop&crop=center",
            applicationPeriod: "2025-07-23 ~ 2025-08-01",
            participationPeriod: "2025-08-02 ~ 2025-08-30",
            link: "https://www.yiyf.or.kr",
            lastUpdated: new Date().toISOString()
        },
        {
            title: "수지청소년문화의집 '수지맞은 베이킹교실 3차' 활동",
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=200&fit=crop&crop=center",
            applicationPeriod: "2025-06-19 ~ 2025-07-04",
            participationPeriod: "2025-07-05 ~ 2025-07-26",
            link: "https://www.yiyf.or.kr",
            lastUpdated: new Date().toISOString()
        },
        {
            title: "유림청소년문화의집 청소년이 배우는 역사의 진실 '청.사.진' 활동공유",
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop&crop=center",
            applicationPeriod: "2025-08-30 ~ 2025-09-13",
            participationPeriod: "2025-08-30 ~ 2025-09-13",
            link: "https://www.yiyf.or.kr",
            lastUpdated: new Date().toISOString()
        },
        {
            title: "처인성어울림센터 아트살롱 1회차 활동",
            image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center",
            applicationPeriod: "2025-08-12 ~ 2025-08-19",
            participationPeriod: "2025-09-06 ~ 2025-09-06",
            link: "https://www.yiyf.or.kr",
            lastUpdated: new Date().toISOString()
        }
    ];
}

// 용인시청소년미래재단 프로그램 정보 API (개선된 버전)
app.get('/api/programs', async (req, res) => {
    try {
        console.log('프로그램 정보 요청 받음...');
        
        // 캐시된 데이터 가져오기
        const programs = await getCachedPrograms();
        
        // 캐시 정보 헤더 추가
        res.set({
            'Cache-Control': 'public, max-age=300', // 5분 캐시
            'Last-Modified': programCache.lastUpdated ? programCache.lastUpdated.toUTCString() : new Date().toUTCString(),
            'X-Cache-Status': programCache.lastUpdated ? 'HIT' : 'MISS',
            'X-Data-Count': programs.length.toString()
        });
        
        console.log(`${programs.length}개 프로그램 정보 반환 완료`);
        res.json(programs);
        
    } catch (error) {
        console.error('프로그램 로딩 오류:', error);
        
        // 오류 시 기본 데이터 반환
        const fallbackPrograms = getFallbackPrograms();
        res.status(200).json(fallbackPrograms);
    }
});

// 프로그램 데이터 강제 새로고침 API
app.post('/api/programs/refresh', async (req, res) => {
    try {
        console.log('프로그램 데이터 강제 새로고침 요청...');
        
        // 캐시 무효화
        programCache.data = null;
        programCache.lastUpdated = null;
        
        // 새로운 데이터 로드
        const programs = await scrapePrograms();
        
        res.json({
            success: true,
            message: '프로그램 데이터가 성공적으로 새로고침되었습니다.',
            count: programs.length,
            lastUpdated: programCache.lastUpdated.toISOString()
        });
        
    } catch (error) {
        console.error('프로그램 새로고침 오류:', error);
        res.status(500).json({
            success: false,
            message: '프로그램 데이터 새로고침에 실패했습니다.',
            error: error.message
        });
    }
});

// 프로그램 데이터 수동 업데이트 API
app.post('/api/programs/update', async (req, res) => {
    try {
        console.log('프로그램 데이터 수동 업데이트 요청...');
        
        const { programs } = req.body;
        
        if (!programs || !Array.isArray(programs)) {
            return res.status(400).json({
                success: false,
                message: '프로그램 데이터가 올바르지 않습니다.'
            });
        }
        
        // 수동 데이터 저장
        const data = {
            programs: programs,
            lastUpdated: new Date().toISOString(),
            source: "manual_update"
        };
        
        // 파일에 저장
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(
            path.join(__dirname, 'programs-data.json'), 
            JSON.stringify(data, null, 2)
        );
        
        // 캐시 무효화
        programCache.data = null;
        programCache.lastUpdated = null;
        
        res.json({
            success: true,
            message: '프로그램 데이터가 성공적으로 업데이트되었습니다.',
            count: programs.length,
            lastUpdated: data.lastUpdated
        });
        
    } catch (error) {
        console.error('프로그램 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '프로그램 데이터 업데이트에 실패했습니다.',
            error: error.message
        });
    }
});

// 데이터베이스 초기화 후 서버 시작
initializeFirebase()
    .then(async () => {
        // 프로그램 데이터 초기 로드
        try {
            console.log('프로그램 데이터 초기 로드 시작...');
            await scrapePrograms();
            console.log('프로그램 데이터 초기 로드 완료');
        } catch (error) {
            console.error('프로그램 데이터 초기 로드 실패:', error);
        }
        
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
            console.log(`📊 환경: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 클라우드타입 배포 준비 완료`);
            console.log(`🔗 http://localhost:${PORT} 에서 확인하세요.`);
        });
        
        // 정기적인 프로그램 데이터 자동 새로고침 (10분마다)
        const autoRefreshInterval = setInterval(async () => {
            try {
                console.log('정기 프로그램 데이터 자동 새로고침 시작...');
                await scrapePrograms();
                console.log('정기 프로그램 데이터 자동 새로고침 완료');
            } catch (error) {
                console.error('정기 프로그램 데이터 자동 새로고침 실패:', error);
            }
        }, 10 * 60 * 1000); // 10분마다

        // 클라우드타입 환경에서의 graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
            clearInterval(autoRefreshInterval);
            server.close(() => {
                console.log('서버가 정상적으로 종료되었습니다.');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT 신호를 받았습니다. 서버를 종료합니다...');
            clearInterval(autoRefreshInterval);
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
    