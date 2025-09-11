const firebaseDb = require('./firebase-database');

async function initializeFirebaseData() {
    try {
        console.log('파이어베이스 데이터 초기화 시작...');
        
        // 기본 시설 데이터 초기화
        await firebaseDb.initializeDefaultFacilities();
        
        console.log('파이어베이스 데이터 초기화 완료!');
        process.exit(0);
    } catch (error) {
        console.error('파이어베이스 데이터 초기화 실패:', error);
        process.exit(1);
    }
}

// 스크립트 실행
initializeFirebaseData(); 