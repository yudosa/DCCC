const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBCAYk2w1l8E99Fwem6DP1NirTcoLHye_g",
    authDomain: "hdycc-aba1c.firebaseapp.com",
    projectId: "hdycc-aba1c",
    storageBucket: "hdycc-aba1c.firebasestorage.app",
    messagingSenderId: "398444607932",
    appId: "1:398444607932:web:a226871df0663224e513b9",
    measurementId: "G-HRRLLDP0SV",
    databaseURL: "https://hdycc-aba1c-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function checkReservations() {
    try {
        console.log('현재 예약 데이터 상태를 확인합니다...');
        
        // 모든 예약 데이터 가져오기
        const reservationsRef = ref(database, 'reservations');
        const snapshot = await get(reservationsRef);
        
        if (!snapshot.exists()) {
            console.log('예약 데이터가 없습니다.');
            return;
        }
        
        const reservations = snapshot.val();
        console.log('\n=== 예약 데이터 전체 구조 ===');
        console.log(JSON.stringify(reservations, null, 2));
        
        const res = reservations.find(r =>
            r.space === space.name &&
            r.detail === detail &&
            r.start_time === hour &&
            (r.status === 'active' || !r.status)
        );
        
    } catch (error) {
        console.error('확인 중 오류 발생:', error);
    }
}

// 스크립트 실행
checkReservations(); 