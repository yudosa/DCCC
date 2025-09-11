const { db } = require('./firebase-config');
const { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} = require('firebase/firestore');

// 예약 데이터 추가
async function addReservation(reservationData) {
  try {
    const docRef = await addDoc(collection(db, 'reservations'), {
      ...reservationData,
      created_at: serverTimestamp()
    });
    console.log('예약이 추가되었습니다. ID:', docRef.id);
    return { id: docRef.id, ...reservationData };
  } catch (error) {
    console.error('예약 추가 오류:', error);
    throw error;
  }
}

// 모든 예약 조회
async function getAllReservations() {
  try {
    const querySnapshot = await getDocs(collection(db, 'reservations'));
    const reservations = [];
    querySnapshot.forEach((doc) => {
      reservations.push({ id: doc.id, ...doc.data() });
    });
    return reservations;
  } catch (error) {
    console.error('예약 조회 오류:', error);
    throw error;
  }
}

// 특정 예약 조회
async function getReservationById(id) {
  try {
    const docRef = doc(db, 'reservations', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
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
    const q = query(
      collection(db, 'reservations'),
      where('date', '==', date),
      orderBy('start_time')
    );
    const querySnapshot = await getDocs(q);
    const reservations = [];
    querySnapshot.forEach((doc) => {
      reservations.push({ id: doc.id, ...doc.data() });
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
    const docRef = doc(db, 'reservations', id);
    await updateDoc(docRef, updateData);
    console.log('예약이 수정되었습니다. ID:', id);
    return { id, ...updateData };
  } catch (error) {
    console.error('예약 수정 오류:', error);
    throw error;
  }
}

// 예약 삭제
async function deleteReservation(id) {
  try {
    await deleteDoc(doc(db, 'reservations', id));
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
    const docRef = await addDoc(collection(db, 'facilities'), facilityData);
    console.log('시설이 추가되었습니다. ID:', docRef.id);
    return { id: docRef.id, ...facilityData };
  } catch (error) {
    console.error('시설 추가 오류:', error);
    throw error;
  }
}

// 모든 시설 조회
async function getAllFacilities() {
  try {
    const querySnapshot = await getDocs(collection(db, 'facilities'));
    const facilities = [];
    querySnapshot.forEach((doc) => {
      facilities.push({ id: doc.id, ...doc.data() });
    });
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

module.exports = {
  addReservation,
  getAllReservations,
  getReservationById,
  getReservationsByDate,
  updateReservation,
  deleteReservation,
  addFacility,
  getAllFacilities,
  initializeDefaultFacilities
}; 