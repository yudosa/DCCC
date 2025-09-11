const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');

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

async function migrateReservations() {
    try {
        console.log('예약 데이터 마이그레이션을 시작합니다...');
        
        // 모든 예약 데이터 가져오기
        const reservationsRef = ref(database, 'reservations');
        const snapshot = await get(reservationsRef);
        
        if (!snapshot.exists()) {
            console.log('예약 데이터가 없습니다.');
            return;
        }
        
        const reservations = snapshot.val();
        const updates = {};
        let count = 0;
        
        // 각 예약에 status 필드 추가
        for (const [key, reservation] of Object.entries(reservations)) {
            if (!reservation.status) {
                if (reservation.cancelled_at) {
                    updates[`reservations/${key}/status`] = 'cancelled';
                } else {
                    updates[`reservations/${key}/status`] = 'active';
                }
                count++;
            }
        }
        
        if (count > 0) {
            // 일괄 업데이트
            await update(ref(database), updates);
            console.log(`${count}개의 예약에 status 필드가 추가(정정)되었습니다.`);
        } else {
            console.log('모든 예약이 이미 status 필드를 가지고 있습니다.');
        }
        
        console.log('마이그레이션이 완료되었습니다.');
        
    } catch (error) {
        console.error('마이그레이션 중 오류 발생:', error);
    }
}

// 스크립트 실행
migrateReservations(); 