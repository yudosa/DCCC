const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set, serverTimestamp } = require('firebase/database');

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

async function createTestReservations() {
    try {
        console.log('댄스연습실 테스트 예약들을 생성합니다...');
        
        const reservationsRef = ref(database, 'reservations');
        
        // 여러 시간대의 테스트 예약 생성
        const testReservations = [
            {
                name: "테스트 사용자1",
                phone: "010-1234-5678",
                facility: "댄스연습실",
                detail: "-",
                date: "2025-01-15",
                start_time: "14:00",
                end_time: "15:00",
                purpose: "테스트 예약1",
                status: "active"
            },
            {
                name: "테스트 사용자2",
                phone: "010-2345-6789",
                facility: "댄스연습실",
                detail: "-",
                date: "2025-01-15",
                start_time: "16:00",
                end_time: "17:00",
                purpose: "테스트 예약2",
                status: "active"
            },
            {
                name: "테스트 사용자3",
                phone: "010-3456-7890",
                facility: "댄스연습실",
                detail: "-",
                date: "2025-01-16",
                start_time: "10:00",
                end_time: "11:00",
                purpose: "테스트 예약3",
                status: "active"
            }
        ];
        
        for (const reservation of testReservations) {
            const newReservationRef = push(reservationsRef);
            const reservationWithTimestamp = {
                ...reservation,
                created_at: serverTimestamp(),
                id: newReservationRef.key
            };
            
            await set(newReservationRef, reservationWithTimestamp);
            console.log(`예약 생성됨: ${reservation.date} ${reservation.start_time}-${reservation.end_time}`);
        }
        
        console.log('모든 댄스연습실 테스트 예약이 생성되었습니다.');
        
    } catch (error) {
        console.error('테스트 예약 생성 오류:', error);
    }
}

// 스크립트 실행
createTestReservations(); 