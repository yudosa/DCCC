const realtimeDb = require('./realtime-database');

async function initializeRealtimeDatabase() {
    try {
        console.log('Firebase Realtime Database 초기화 시작...');
        
        // 기본 시설 데이터 초기화
        await realtimeDb.initializeDefaultFacilities();
        
        console.log('Firebase Realtime Database 초기화 완료!');
        process.exit(0);
    } catch (error) {
        console.error('Firebase Realtime Database 초기화 실패:', error);
        process.exit(1);
    }
}

// 스크립트 실행
initializeRealtimeDatabase(); 