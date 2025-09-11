const { realtimeDb } = require('./firebase-config');
const { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  serverTimestamp,
  onValue
} = require('firebase/database');

// 예약 데이터 추가
async function addReservation(reservationData) {
  try {
    const reservationsRef = ref(realtimeDb, 'reservations');
    const newReservationRef = push(reservationsRef);
    
    const reservationWithTimestamp = {
      ...reservationData,
      status: 'active', // 예약 상태 추가 (active, cancelled, completed)
      created_at: serverTimestamp(),
      id: newReservationRef.key
    };
    
    await set(newReservationRef, reservationWithTimestamp);
    console.log('예약이 추가되었습니다. ID:', newReservationRef.key);
    return reservationWithTimestamp;
  } catch (error) {
    console.error('예약 추가 오류:', error);
    throw error;
  }
}

// 모든 예약 조회
async function getAllReservations() {
  try {
    const reservationsRef = ref(realtimeDb, 'reservations');
    const snapshot = await get(reservationsRef);
    
    const reservations = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        reservations.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return reservations;
  } catch (error) {
    console.error('예약 조회 오류:', error);
    throw error;
  }
}

// 특정 예약 조회
async function getReservationById(id) {
  try {
    const reservationRef = ref(realtimeDb, `reservations/${id}`);
    const snapshot = await get(reservationRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('예약 조회 오류:', error);
    throw error;
  }
}

// 날짜별 예약 조회
async function getReservationsByDate(date) {
  try {
    const reservationsRef = ref(realtimeDb, 'reservations');
    const snapshot = await get(reservationsRef);
    
    const reservations = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const reservation = childSnapshot.val();
        if (reservation.date === date) {
          reservations.push({
            id: childSnapshot.key,
            ...reservation
          });
        }
      });
    }
    
    // 시작 시간으로 정렬
    reservations.sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
    
    return reservations;
  } catch (error) {
    console.error('날짜별 예약 조회 오류:', error);
    throw error;
  }
}

// 예약 수정
async function updateReservation(id, updateData) {
  try {
    const reservationRef = ref(realtimeDb, `reservations/${id}`);
    await update(reservationRef, updateData);
    console.log('예약이 수정되었습니다. ID:', id);
    return { id, ...updateData };
  } catch (error) {
    console.error('예약 수정 오류:', error);
    throw error;
  }
}

// 예약 취소 (상태 변경)
async function cancelReservation(id) {
  try {
    const reservationRef = ref(realtimeDb, `reservations/${id}`);
    const snapshot = await get(reservationRef);
    if (!snapshot.exists()) {
      throw new Error('예약을 찾을 수 없습니다.');
    }
    const reservation = snapshot.val();
    if (reservation.status === 'cancelled') {
      throw new Error('이미 취소된 예약입니다.');
    }
    await update(reservationRef, { 
      status: 'cancelled',
      cancelled_at: serverTimestamp()
    });
    console.log('예약이 취소되었습니다. ID:', id);
    return true;
  } catch (error) {
    console.error('예약 취소 오류:', error);
    throw error;
  }
}

// 예약 삭제 (완전 삭제)
async function deleteReservation(id) {
  try {
    const reservationRef = ref(realtimeDb, `reservations/${id}`);
    await remove(reservationRef);
    console.log('예약이 삭제되었습니다. ID:', id);
    return true;
  } catch (error) {
    console.error('예약 삭제 오류:', error);
    throw error;
  }
}

// 시설 데이터 추가
async function addFacility(facilityData) {
  try {
    const facilitiesRef = ref(realtimeDb, 'facilities');
    const newFacilityRef = push(facilitiesRef);
    
    const facilityWithId = {
      ...facilityData,
      id: newFacilityRef.key
    };
    
    await set(newFacilityRef, facilityWithId);
    console.log('시설이 추가되었습니다. ID:', newFacilityRef.key);
    return facilityWithId;
  } catch (error) {
    console.error('시설 추가 오류:', error);
    throw error;
  }
}

// 모든 시설 조회
async function getAllFacilities() {
  try {
    const facilitiesRef = ref(realtimeDb, 'facilities');
    const snapshot = await get(facilitiesRef);
    
    const facilities = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        facilities.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return facilities;
  } catch (error) {
    console.error('시설 조회 오류:', error);
    throw error;
  }
}

// 기본 시설 데이터 초기화
async function initializeDefaultFacilities() {
  try {
    const facilities = [
      {
        name: '플레이스테이션',
        description: '게임 및 엔터테인먼트 공간',
        max_capacity: 4,
        hourly_rate: 5000
      },
      {
        name: '보드게임',
        description: '보드게임 및 카드게임 공간',
        max_capacity: 8,
        hourly_rate: 3000
      },
      {
        name: '강의실',
        description: '교육 및 세미나 공간',
        max_capacity: 30,
        hourly_rate: 10000
      },
      {
        name: '체육관',
        description: '스포츠 및 운동 공간',
        max_capacity: 50,
        hourly_rate: 15000
      },
      {
        name: '음악실',
        description: '음악 연습 및 공연 공간',
        max_capacity: 20,
        hourly_rate: 8000
      },
      {
        name: '도서관',
        description: '독서 및 학습 공간',
        max_capacity: 40,
        hourly_rate: 3000
      }
    ];

    const existingFacilities = await getAllFacilities();
    
    if (existingFacilities.length === 0) {
      for (const facility of facilities) {
        await addFacility(facility);
      }
      console.log('기본 시설 데이터가 초기화되었습니다.');
    } else {
      console.log('시설 데이터가 이미 존재합니다.');
    }
  } catch (error) {
    console.error('기본 시설 초기화 오류:', error);
    throw error;
  }
}

// 실시간 데이터 리스너 (선택사항)
function listenToReservations(callback) {
  const reservationsRef = ref(realtimeDb, 'reservations');
  
  // 실시간 업데이트 리스너
  const unsubscribe = onValue(reservationsRef, (snapshot) => {
    const reservations = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        reservations.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    callback(reservations);
  });
  
  return unsubscribe; // 리스너 해제 함수 반환
}

module.exports = {
  addReservation,
  getAllReservations,
  getReservationById,
  getReservationsByDate,
  updateReservation,
  cancelReservation,
  deleteReservation,
  addFacility,
  getAllFacilities,
  initializeDefaultFacilities,
  listenToReservations
}; 