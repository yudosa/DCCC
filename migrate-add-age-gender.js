const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');

// Firebase 설정 (기존 migrate-reservations.js와 동일하게 맞춤)
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function addAgeGenderToReservations() {
    try {
        console.log('예약 데이터 age/gender 필드 보정 시작...');
        const reservationsRef = ref(database, 'reservations');
        const snapshot = await get(reservationsRef);
        if (!snapshot.exists()) {
            console.log('예약 데이터가 없습니다.');
            return;
        }
        const reservations = snapshot.val();
        const updates = {};
        let count = 0;
        for (const [key, reservation] of Object.entries(reservations)) {
            if (!reservation.age) {
                updates[`reservations/${key}/age`] = '미입력';
                count++;
            }
            if (!reservation.gender) {
                updates[`reservations/${key}/gender`] = '미입력';
                count++;
            }
        }
        if (count > 0) {
            await update(ref(database), updates);
            console.log(`${count}개의 예약에 age/gender 필드를 추가했습니다.`);
        } else {
            console.log('모든 예약에 age/gender 필드가 이미 있습니다.');
        }
        console.log('보정 완료!');
    } catch (error) {
        console.error('보정 중 오류 발생:', error);
    }
}

addAgeGenderToReservations(); 