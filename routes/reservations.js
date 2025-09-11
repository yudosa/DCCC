const express = require('express');
const router = express.Router();
const realtimeDb = require('../realtime-database');
const moment = require('moment');

// 모든 예약 조회
router.get('/', async (req, res) => {
    try {
        const reservations = await realtimeDb.getAllReservations();
        // 날짜와 시간으로 정렬
        reservations.sort((a, b) => {
            const dateCompare = moment(b.date).diff(moment(a.date));
            if (dateCompare !== 0) return dateCompare;
            return moment(a.start_time, 'HH:mm').diff(moment(b.start_time, 'HH:mm'));
        });
        res.json(reservations);
    } catch (error) {
        console.error('예약 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 특정 날짜의 예약 조회
router.get('/date/:date', async (req, res) => {
    try {
        const date = req.params.date;
        const reservations = await realtimeDb.getReservationsByDate(date);
        res.json(reservations);
    } catch (error) {
        console.error('날짜별 예약 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 새로운 예약 생성
router.post('/', async (req, res) => {
    console.log('예약 생성 요청 받음:', req.body);
    
    const { name, phone, facility, detail, date, start_time, end_time, purpose, gender, age, agreedPersonalInfo } = req.body;
    
    // 필수 필드 검증 (phone은 선택사항으로 변경)
    if (!name || !facility || !date || !start_time || !end_time) {
        console.log('필수 필드 누락:', { name, facility, date, start_time, end_time });
        return res.status(400).json({ error: '필수 필드를 입력해주세요. (이름, 시설, 날짜, 시작시간, 종료시간)' });
    }
    
    // 전화번호가 없으면 기본값 설정
    let phoneNumber = phone || '미입력';
    // phone이 4자리가 아니면 에러
    if (!/^\d{4}$/.test(phoneNumber)) {
        return res.status(400).json({ error: '핸드폰번호 끝 4자리를 입력해주세요.' });
    }
    
    // 날짜 형식 검증
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        console.log('잘못된 날짜 형식:', date);
        return res.status(400).json({ error: '올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD).' });
    }
    
    // 시간 형식 검증
    if (!moment(start_time, 'HH:mm', true).isValid() || !moment(end_time, 'HH:mm', true).isValid()) {
        console.log('잘못된 시간 형식:', { start_time, end_time });
        return res.status(400).json({ error: '올바른 시간 형식을 입력해주세요 (HH:mm).' });
    }
    
    // 과거 날짜 예약 방지 (오늘 날짜는 예약 가능)
    const today = moment().startOf('day');
    const selectedDate = moment(date).startOf('day');
    
    if (selectedDate.isBefore(today)) {
        console.log('과거 날짜 예약 시도:', date);
        return res.status(400).json({ error: '과거 날짜는 예약할 수 없습니다.' });
    }
    
    // 시간 순서 검증
    if (moment(start_time, 'HH:mm').isSameOrAfter(moment(end_time, 'HH:mm'))) {
        console.log('잘못된 시간 순서:', { start_time, end_time });
        return res.status(400).json({ error: '종료 시간은 시작 시간보다 늦어야 합니다.' });
    }
    
    try {
        // 중복 예약 확인
        const existingReservations = await realtimeDb.getReservationsByDate(date);
        const conflictingReservation = existingReservations.find(reservation => {
            if (reservation.status !== 'active') return false; // active만 중복 체크
            if (reservation.facility !== facility || reservation.detail !== (detail || '-')) {
                return false;
            }
            const reservationStart = moment(reservation.start_time, 'HH:mm');
            const reservationEnd = moment(reservation.end_time, 'HH:mm');
            const newStart = moment(start_time, 'HH:mm');
            const newEnd = moment(end_time, 'HH:mm');
            return (newStart.isBefore(reservationEnd) && newEnd.isAfter(reservationStart));
        });
        
        if (conflictingReservation) {
            console.log('중복 예약 발견:', conflictingReservation);
            return res.status(400).json({ error: '해당 시간에 이미 예약이 있습니다.' });
        }
        
        // 예약 생성
        const reservationData = {
            name,
            phone: phoneNumber,
            facility,
            detail: detail || '-',
            date,
            start_time,
            end_time,
            purpose: purpose || '',
            gender: gender || '',
            age: age || '',
            agreedPersonalInfo: agreedPersonalInfo || ''
        };
        
        const newReservation = await realtimeDb.addReservation(reservationData);
        
        console.log('예약 생성 성공, ID:', newReservation.id);
        res.json({
            id: newReservation.id,
            message: '예약이 성공적으로 생성되었습니다.',
            reservation: newReservation
        });
        
    } catch (error) {
        console.error('예약 생성 중 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 예약 수정
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, facility, date, start_time, end_time, purpose } = req.body;
        
        const updateData = {
            name,
            phone,
            facility,
            date,
            start_time,
            end_time,
            purpose: purpose || ''
        };
        
        await realtimeDb.updateReservation(id, updateData);
        res.json({ message: '예약이 성공적으로 수정되었습니다.' });
        
    } catch (error) {
        console.error('예약 수정 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 예약 취소 (상태 변경)
router.patch('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        await realtimeDb.cancelReservation(id);
        res.json({ message: '예약이 성공적으로 취소되었습니다.' });
    } catch (error) {
        console.error('예약 취소 오류:', error);
        if (error.message === '예약을 찾을 수 없습니다.') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === '이미 취소된 예약입니다.') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// 예약 삭제 (완전 삭제)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await realtimeDb.deleteReservation(id);
        res.json({ message: '예약이 성공적으로 삭제되었습니다.' });
        
    } catch (error) {
        console.error('예약 삭제 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 시설 목록 조회
router.get('/facilities', async (req, res) => {
    try {
        const facilities = await realtimeDb.getAllFacilities();
        facilities.sort((a, b) => a.name.localeCompare(b.name));
        res.json(facilities);
    } catch (error) {
        console.error('시설 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 기간별 예약 조회
router.get('/range', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: '시작일과 종료일을 입력하세요.' });
        }
        
        const allReservations = await realtimeDb.getAllReservations();
        const filteredReservations = allReservations.filter(reservation => {
            const reservationDate = moment(reservation.date);
            return reservationDate.isBetween(start, end, 'day', '[]'); // 시작일과 종료일 포함
        });
        
        // 날짜와 시간으로 정렬
        filteredReservations.sort((a, b) => {
            const dateCompare = moment(a.date).diff(moment(b.date));
            if (dateCompare !== 0) return dateCompare;
            return moment(a.start_time, 'HH:mm').diff(moment(b.start_time, 'HH:mm'));
        });
        
        res.json(filteredReservations);
        
    } catch (error) {
        console.error('기간별 예약 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 