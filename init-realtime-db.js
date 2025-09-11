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

window.cancelReservation = cancelReservation; 

function cancelReservation(btn) {
    console.log('취소 버튼 클릭:', btn, btn.getAttribute('data-id'));
    const reservationId = btn.getAttribute('data-id');
    console.log('lastReservations:', window.lastReservations, '찾는 id:', reservationId);
    const reservation = window.lastReservations?.find(r => `${r.id}` === `${reservationId}`);
    console.log('find 결과:', reservation);
    if (!reservation) {
        alert('예약 정보를 찾을 수 없습니다.');
        return;
    }
    console.log('showCancelModal 호출 직전');
    showCancelModal(reservation, async () => { ... });
} 

console.log('displayReservations 전달 id:', reservations.map(r => r.id)); 

console.log('lastReservations:', window.lastReservations.map(r => r.id)); 

function showCancelModal(reservation, onConfirm) {
    console.log('showCancelModal 실행:', reservation);
    // ... 기존 코드 ...
} 

window.showCancelModal = showCancelModal; 