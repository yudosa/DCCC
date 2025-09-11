const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const realtimeDb = require('./realtime-database');
// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

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

// 용인시청소년미래재단 프로그램 정보 API (실제 홈페이지에서 스크래핑)
app.get('/api/programs', async (req, res) => {
    try {
        console.log('용인시청소년미래재단 홈페이지에서 프로그램 정보 스크래핑 중...');
        
        const axios = require('axios');
        const cheerio = require('cheerio');
        
        // 실제 홈페이지에서 프로그램 정보 스크래핑 시도
        let programs = [];
        
        try {
            // 실제 프로그램 공지사항 페이지들에서 정보 찾기
            const programPages = [
                'https://www.yiyf.or.kr/lay1/program/S1T1C775/youth_program/index.do', // 청소년 프로그램
                'https://www.yiyf.or.kr/lay1/program/S1T1C776/youth_program/index.do', // 문화의집 프로그램
                'https://www.yiyf.or.kr/lay1/program/S1T1C777/youth_program/index.do', // 기타 프로그램
                'https://www.yiyf.or.kr/lay1/notice/S1T1C775/list.do', // 공지사항
                'https://www.yiyf.or.kr/lay1/notice/S1T1C776/list.do', // 청소년 공지사항
                'https://www.yiyf.or.kr/lay1/notice/S1T1C777/list.do' // 문화의집 공지사항
            ];
            
            for (const pageUrl of programPages) {
                try {
                    console.log(`프로그램 공지사항 페이지 스크래핑 시도: ${pageUrl}`);
                    const response = await axios.get(pageUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                            'Referer': 'https://www.yiyf.or.kr'
                        },
                        timeout: 15000
                    });
                    
                    const $ = cheerio.load(response.data);
                    
                    // 실제 프로그램 공지사항에서 정보 추출
                    $('tr, .list-item, .board-item, .notice-item, .item').each((index, element) => {
                        if (programs.length >= 8) return false;
                        
                        const $el = $(element);
                        const title = $el.find('a, .title, .subject, .tit, td a').text().trim();
                        const imageUrl = $el.find('img').attr('src');
                        const link = $el.find('a').attr('href');
                        
                        // 실제 프로그램 제목인지 확인 (메뉴나 탭이 아닌)
                        if (title && title.length > 5 && 
                            !title.includes('경영') && 
                            !title.includes('ESG') && 
                            !title.includes('인권') && 
                            !title.includes('윤리') &&
                            !title.includes('사회공헌') &&
                            !title.includes('고객') &&
                            (title.includes('프로그램') || 
                             title.includes('활동') || 
                             title.includes('교실') || 
                             title.includes('체험') ||
                             title.includes('모집') ||
                             title.includes('접수') ||
                             title.includes('교육'))) {
                            
                            let fullImageUrl = '';
                            if (imageUrl) {
                                fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://www.yiyf.or.kr${imageUrl}`;
                            } else {
                                // 기본 프로그램 이미지 사용
                                fullImageUrl = `https://images.unsplash.com/photo-${1500000000000 + programs.length * 1000000}?w=400&h=200&fit=crop&crop=center`;
                            }
                            
                            programs.push({
                                title: title,
                                image: fullImageUrl,
                                applicationPeriod: "신청기간 정보 없음",
                                participationPeriod: "참여기간 정보 없음",
                                link: link ? (link.startsWith('http') ? link : `https://www.yiyf.or.kr${link}`) : 'https://www.yiyf.or.kr'
                            });
                            
                            console.log(`실제 프로그램 발견: ${title}`);
                        }
                    });
                    
                    if (programs.length > 0) break; // 프로그램을 찾았으면 중단
                    
                } catch (pageError) {
                    console.log(`페이지 스크래핑 실패: ${pageUrl} - ${pageError.message}`);
                }
            }
            
        // 메인 페이지에서 "다양한 프로그램을 참여해 보세요" 섹션 찾기
        if (programs.length === 0) {
            console.log('메인 페이지에서 "다양한 프로그램을 참여해 보세요" 섹션 찾기 시도');
            const mainResponse = await axios.get('https://www.yiyf.or.kr', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 20000
            });
            
            const $ = cheerio.load(mainResponse.data);
            
            // "다양한 프로그램을 참여해 보세요" 섹션 찾기 - 더 정확한 방법
            let programSection = null;
            
            // 먼저 텍스트로 정확한 섹션 찾기
            $('*').each((index, element) => {
                const $el = $(element);
                const text = $el.text();
                
                // "다양한 프로그램을 참여해 보세요" 텍스트가 포함된 요소 찾기
                if (text.includes('다양한 프로그램을 참여해 보세요') || 
                    text.includes('프로그램을 참여해 보세요')) {
                    
                    // 해당 요소의 부모나 형제 요소에서 실제 프로그램 링크들이 있는 섹션 찾기
                    let parent = $el.parent();
                    let foundPrograms = 0;
                    
                    // 부모 요소에서 프로그램 링크 개수 확인
                    parent.find('a').each((i, link) => {
                        const linkText = $(link).text().trim();
                        if (linkText && linkText.length > 10 && linkText.length < 80) {
                            // 실제 프로그램인지 확인
                            const programKeywords = ['베이킹', '아트', '역사', '문화', '청소년', '리더십', '멘토', '동아리', '교실', '활동', '체험', '교육'];
                            const excludeKeywords = ['공고문', '안내', '발표', '당첨자', '모집', '신청', '참여', '체험', '교육', '상담', '복지', '지원', '센터', '꿈드림'];
                            
                            const hasProgramKeyword = programKeywords.some(keyword => linkText.includes(keyword));
                            const hasExcludeKeyword = excludeKeywords.some(keyword => linkText.includes(keyword));
                            
                            if (hasProgramKeyword && !hasExcludeKeyword) {
                                foundPrograms++;
                            }
                        }
                    });
                    
                    // 프로그램이 3개 이상 발견되면 이 섹션 사용
                    if (foundPrograms >= 3) {
                        programSection = parent;
                        console.log(`프로그램 섹션 발견: ${foundPrograms}개 프로그램 포함`);
                        return false; // break
                    }
                }
            });
            
            // 섹션을 찾지 못했다면 다른 방법으로 시도
            if (!programSection) {
                const sectionSelectors = [
                    '.program-section',
                    '.youth-program',
                    '.activity-program',
                    '.main-program',
                    '#program',
                    '.content-section',
                    '.main-content',
                    '.container'
                ];
                
                for (const selector of sectionSelectors) {
                    const section = $(selector).first();
                    if (section.length > 0) {
                        programSection = section;
                        console.log(`대체 섹션 사용: ${selector}`);
                        break;
                    }
                }
            }
            
            let foundPrograms = [];
            
            if (programSection && programSection.length > 0) {
                console.log('프로그램 섹션에서 링크 찾기 시작');
                
                // 섹션 내에서 링크들 찾기
                const linkSelectors = [
                    'a',
                    '.program-item a',
                    '.item a',
                    'li a',
                    'td a',
                    '.title a',
                    '.name a'
                ];
                
                linkSelectors.forEach(selector => {
                    programSection.find(selector).each((index, element) => {
                        if (foundPrograms.length >= 8) return false;
                        
                        const $el = $(element);
                        const title = $el.text().trim();
                        const link = $el.attr('href');
                        
                        // 프로그램 제목인지 확인 (길이와 내용)
                        if (title && title.length > 10 && title.length < 80) {
                            // 실제 프로그램 키워드 확인 (더 구체적으로)
                            const programKeywords = [
                                '베이킹교실', '아트살롱', '청.사.진', '체험활동', '교육프로그램', '문화프로그램',
                                '수지청소년문화의집', '유림청소년문화의집', '처인성어울림센터', '동천청소년문화의집',
                                '꿈드림', '미래교육', '리더십', '멘토', '동아리', '교실', '활동', '체험'
                            ];
                            
                            // 제외할 키워드 (공지사항, 상담센터 등)
                            const excludeKeywords = [
                                '메뉴', '로그인', '회원가입', '사이트맵', '홈', '메인', '경영', 'ESG',
                                '인권', '윤리', '통합안내', '정책', '현황', '헌장', '사회공헌', '고객',
                                '원클릭', '수강', '예약', '내역', 'CCTV', '설치', '행정예고', '개관식',
                                '운영위원회', '욕구조사', '공고문', '안내', '발표', '당첨자', '관련법규',
                                '상담복지센터', '지원센터', '꿈드림', '모집합니다', '활동팀', '분소'
                            ];
                            
                            const hasProgramKeyword = programKeywords.some(keyword => title.includes(keyword));
                            const hasExcludeKeyword = excludeKeywords.some(keyword => title.includes(keyword));
                            
                            // 더 엄격한 필터링: 실제 프로그램만 허용
                            if (hasProgramKeyword && !hasExcludeKeyword && 
                                !title.includes('모집') && !title.includes('신청') && 
                                !title.includes('상담') && !title.includes('복지') && 
                                !title.includes('지원') && !title.includes('센터')) {
                                // 이미지 찾기
                                let imageUrl = getProgramImage(title);
                                const imgElement = $el.find('img').first();
                                if (imgElement.length) {
                                    const imgSrc = imgElement.attr('src');
                                    if (imgSrc) {
                                        imageUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.yiyf.or.kr${imgSrc}`;
                                    }
                                }
                                
                                // 날짜 정보 추출 시도
                                const parentText = $el.parent().text();
                                const dateRegex = /(\d{4}-\d{2}-\d{2})/g;
                                const dates = parentText.match(dateRegex);
                                
                                let applicationPeriod = "신청기간 정보 없음";
                                let participationPeriod = "참여기간 정보 없음";
                                
                                if (dates && dates.length >= 2) {
                                    applicationPeriod = `${dates[0]} ~ ${dates[1]}`;
                                    if (dates.length >= 4) {
                                        participationPeriod = `${dates[2]} ~ ${dates[3]}`;
                                    }
                                }
                                
                                foundPrograms.push({
                                    title: title,
                                    image: imageUrl,
                                    applicationPeriod: applicationPeriod,
                                    participationPeriod: participationPeriod,
                                    link: link ? (link.startsWith('http') ? link : `https://www.yiyf.or.kr${link}`) : 'https://www.yiyf.or.kr'
                                });
                                
                                console.log(`실제 프로그램 발견: ${title}`);
                            }
                        }
                    });
                });
            } else {
                console.log('프로그램 섹션을 찾을 수 없음, 전체 페이지에서 검색');
                
                // 전체 페이지에서 프로그램 관련 링크 찾기
                $('a').each((index, element) => {
                    if (foundPrograms.length >= 8) return false;
                    
                    const $el = $(element);
                    const title = $el.text().trim();
                    const link = $el.attr('href');
                    
                    if (title && title.length > 10 && title.length < 80) {
                        const programKeywords = [
                            '베이킹교실', '아트살롱', '청.사.진', '체험활동', '교육프로그램', '문화프로그램',
                            '수지청소년문화의집', '유림청소년문화의집', '처인성어울림센터', '동천청소년문화의집',
                            '꿈드림', '미래교육', '리더십', '멘토', '동아리', '교실', '활동', '체험'
                        ];
                        
                        const excludeKeywords = [
                            '메뉴', '로그인', '회원가입', '사이트맵', '홈', '메인', '경영', 'ESG',
                            '인권', '윤리', '통합안내', '정책', '현황', '헌장', '사회공헌', '고객',
                            '원클릭', '수강', '예약', '내역', 'CCTV', '설치', '행정예고', '개관식',
                            '운영위원회', '욕구조사', '공고문', '안내', '발표', '당첨자', '관련법규',
                            '상담복지센터', '지원센터', '꿈드림', '모집합니다', '활동팀', '분소'
                        ];
                        
                        const hasProgramKeyword = programKeywords.some(keyword => title.includes(keyword));
                        const hasExcludeKeyword = excludeKeywords.some(keyword => title.includes(keyword));
                        
                        // 더 엄격한 필터링: 실제 프로그램만 허용
                        if (hasProgramKeyword && !hasExcludeKeyword && 
                            !title.includes('모집') && !title.includes('신청') && 
                            !title.includes('상담') && !title.includes('복지') && 
                            !title.includes('지원') && !title.includes('센터')) {
                            let imageUrl = getProgramImage(title);
                            const imgElement = $el.find('img').first();
                            if (imgElement.length) {
                                const imgSrc = imgElement.attr('src');
                                if (imgSrc) {
                                    imageUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.yiyf.or.kr${imgSrc}`;
                                }
                            }
                            
                            foundPrograms.push({
                                title: title,
                                image: imageUrl,
                                applicationPeriod: "신청기간 정보 없음",
                                participationPeriod: "참여기간 정보 없음",
                                link: link ? (link.startsWith('http') ? link : `https://www.yiyf.or.kr${link}`) : 'https://www.yiyf.or.kr'
                            });
                            
                            console.log(`전체 페이지에서 프로그램 발견: ${title}`);
                        }
                    }
                });
            }
            
            // 중복 제거 및 순서 유지
            const uniquePrograms = foundPrograms.filter((program, index, self) => 
                index === self.findIndex(p => p.title === program.title)
            );
            
            programs = uniquePrograms;
            console.log(`메인 페이지에서 ${programs.length}개 실제 프로그램 발견`);
        }
            
            console.log(`스크래핑 성공: ${programs.length}개 실제 프로그램 발견`);
            
        } catch (scrapingError) {
            console.log('스크래핑 실패:', scrapingError.message);
        }

        // 스크래핑된 데이터가 없으면 실제 홈페이지의 알려진 프로그램들 사용
        if (programs.length === 0) {
            console.log('스크래핑 실패, 실제 홈페이지의 알려진 프로그램들 사용');
            programs = [
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
        }
        
        console.log(`${programs.length}개 프로그램 정보 로딩 완료`);
        res.json(programs);
        
    } catch (error) {
        console.error('프로그램 스크래핑 오류:', error);
        
        // 오류 시 기본 데이터 반환
        const fallbackPrograms = [
            {
                title: "수지청소년문화의집 '수지맞은 베이킹교실 4차' 활동",
                image: "https://www.yiyf.or.kr/images/program/baking4.jpg",
                applicationPeriod: "2025-07-23 ~ 2025-08-01",
                participationPeriod: "2025-08-02 ~ 2025-08-30",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "수지청소년문화의집 '수지맞은 베이킹교실 3차' 활동",
                image: "https://www.yiyf.or.kr/images/program/baking3.jpg",
                applicationPeriod: "2025-06-19 ~ 2025-07-04",
                participationPeriod: "2025-07-05 ~ 2025-07-26",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "유림청소년문화의집 청소년이 배우는 역사의 진실 '청.사.진' 활동공유",
                image: "https://www.yiyf.or.kr/images/program/history.jpg",
                applicationPeriod: "2025-08-30 ~ 2025-09-13",
                participationPeriod: "2025-08-30 ~ 2025-09-13",
                link: "https://www.yiyf.or.kr"
            },
            {
                title: "처인성어울림센터 아트살롱 1회차 활동",
                image: "https://www.yiyf.or.kr/images/program/art.jpg",
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