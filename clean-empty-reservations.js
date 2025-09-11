const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, remove } = require('firebase/database');

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

async function cleanEmptyReservations() {
    try {
        console.log('빈 예약 데이터 정리를 시작합니다...');
        const reservationsRef = ref(database, 'reservations');
        const snapshot = await get(reservationsRef);
        if (!snapshot.exists()) {
            console.log('예약 데이터가 없습니다.');
            return;
        }
        const reservations = snapshot.val();
        let deleteCount = 0;
        for (const [key, reservation] of Object.entries(reservations)) {
            // 완전히 빈 객체이거나 주요 필드가 모두 없는 경우 삭제
            if (!reservation || Object.keys(reservation).length === 0 ||
                (!reservation.name && !reservation.space && !reservation.date && !reservation.start && !reservation.end)) {
                await remove(ref(database, `reservations/${key}`));
                console.log(`빈 예약 데이터 삭제: ${key}`);
                deleteCount++;
            }
        }
        if (deleteCount === 0) {
            console.log('삭제할 빈 예약 데이터가 없습니다.');
        } else {
            console.log(`${deleteCount}개의 빈 예약 데이터가 삭제되었습니다.`);
        }
    } catch (error) {
        console.error('정리 중 오류 발생:', error);
    }
}

cleanEmptyReservations(); 