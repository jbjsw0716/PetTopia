// F-20 · F-21 예약 공통 판정.
//
// 예약서 화면(ReservationPage)과 Layout 의 addReservation 이 같은 규칙을 쓴다.
// 같은 계산이 두 곳에 생기면 갈라진다 (utils/money.js 가 getCartAmounts 를 갖는 것과
// 같은 이유). 화면은 이 함수로 미리 걸러 여러 항목을 한 번에 보여주고,
// Layout 은 저장 직전에 같은 함수로 다시 본다.

import { MAX_QUANTITY } from './constants.js';
import { addMinutes, getDateOnlyTime, getTimeOfDay, getWeekdayKey, isOverlapping } from './datetime.js';

const MIN_DAYS_AHEAD = 1;
const MAX_DAYS_AHEAD = 30;

// 장기 돌봄만 '맡기는 시각·찾는 시각'으로 본다.
// 1박이 1440분이라 장기 돌봄은 늘 다음 날 이후에 끝난다. 다른 서비스처럼 "하루 안에서 끝나는가"로
// 보면 어느 펫시터에게도 예약할 수 없었다. 그래서 맡기는 시각은 맡기는 날 요일의 이용 시간 안,
// 찾는 시각은 찾는 날 요일의 이용 시간 안인지를 본다 — 찾는 날이 휴무면 막힌다.
// 데이케어까지 넓히지 않는다. 넓히면 '데이케어 2일'이 15:00 → 다음 날 09:00 같은 18시간 연속
// 예약으로 통과한다.
const DROP_OFF_PICK_UP_SERVICE_ID = 'BOARDING';

// 데이케어는 1일만 받는다. 1일이 540분(9시간)이라 2일은 18시간 연속이 되어
// 어느 요일 시간대에도 들어가지 않는다. 다른 서비스의 상한은 담기 수량과 같은 99 다.
const DAYCARE_SERVICE_ID = 'DAYCARE';

const PERIOD_ERROR = '예약은 내일부터 30일 뒤까지 선택할 수 있습니다.';
const AVAILABILITY_ERROR = '선택한 펫시터는 그 시간에 돌봄을 제공하지 않습니다.';
const OVERLAP_ERROR = '같은 펫시터에게 이미 겹치는 시간의 예약이 있습니다.';
// 날짜를 고른 시점에 그 요일이 통째로 휴무일 때 쓰는 문구 (제출 검사가 아니라 즉시 안내)
const DAY_OFF_MESSAGE = '선택한 날짜에는 돌봄을 제공하지 않습니다.';

// 그 요일의 이용 가능 시간. mock 에 없는 요일은 휴무라 null 이다.
function findAvailableHour(availableHours, weekdayKey) {
  return availableHours.find((item) => item.day === weekdayKey) || null;
}

function getEndAt(startAt, quantity, durationMinutes) {
  return addMinutes(startAt, quantity * durationMinutes);
}

function usesDropOffPickUp(serviceId) {
  return serviceId === DROP_OFF_PICK_UP_SERVICE_ID;
}

// 한 번에 예약할 수 있는 최대 수량 — 예약서의 수량 입력과 Layout 의 재판정이 같이 쓴다
function getMaxReservationQuantity(serviceId) {
  return serviceId === DAYCARE_SERVICE_ID ? 1 : MAX_QUANTITY;
}

// 한 시각이 그 요일 이용 가능 시간 안인가 — 시작·끝 시각을 포함한다
function isTimeWithinHour(isoString, hour) {
  const time = getTimeOfDay(isoString);
  return time >= hour.startTime && time <= hour.endTime;
}

// F-21 검사 3 — 이용 가능 시간. 제출 검사(getReservationErrors)와 예약서 미리보기가 같이 쓴다.
function isWithinAvailableHours({ serviceId, startAt, endAt, availableHours }) {
  const startHour = findAvailableHour(availableHours, getWeekdayKey(startAt));
  if (!startHour) {
    return false;
  }

  if (usesDropOffPickUp(serviceId)) {
    const endHour = findAvailableHour(availableHours, getWeekdayKey(endAt));
    return endHour !== null && isTimeWithinHour(startAt, startHour) && isTimeWithinHour(endAt, endHour);
  }

  // 나머지 서비스는 시작~종료가 그 요일 시간대 안이어야 한다. 종료까지 확인한다.
  // 자정을 넘겨 끝나면(예: 23:00 시작 + 60분 = 다음 날 00:00) 종료의 "시:분"만 보면 작은
  // 값으로 되돌아가 시간대 안으로 잘못 보인다. 날짜가 이미 시작일과 달라졌다는 것 자체가
  // 그 요일 시간대(하루 안)를 벗어났다는 뜻이므로 시각을 보기 전에 먼저 날짜부터 같은지 본다.
  if (getDateOnlyTime(startAt) !== getDateOnlyTime(endAt)) {
    return false;
  }
  return getTimeOfDay(startAt) >= startHour.startTime && getTimeOfDay(endAt) <= startHour.endTime;
}

// F-21 검사 2~4 (선택 가능 기간 · 이용 가능 시간 · 중복)를 모두 돌려 걸린 것을 전부 모은다.
// 통과하면 빈 배열이다. 검사 1(필수 값)은 항목마다 다른 자리에 표시해야 해서 화면이 따로 한다.
//
// sitterReservations 는 "같은 펫시터 + 취소 아님" 조건으로 이미 걸러 넘긴다(부르는 쪽 책임) —
// 취소된 예약은 중복 판정에서 제외하기 때문이다.
function getReservationErrors({ serviceId, sitterReservations, startAt, endAt, availableHours }) {
  const errors = [];
  const now = new Date();

  // 2. 선택 가능 기간 — 내일부터 30일 뒤까지. 날짜만 비교한다
  const startDateTime = getDateOnlyTime(startAt);
  const todayTime = getDateOnlyTime(now.toISOString());
  const minTime = todayTime + MIN_DAYS_AHEAD * 24 * 60 * 60 * 1000;
  const maxTime = todayTime + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000;
  if (startDateTime < minTime || startDateTime > maxTime) {
    errors.push(PERIOD_ERROR);
  }

  // 3. 이용 가능 시간 — 종료까지 확인한다. 장기 돌봄은 맡기는 시각·찾는 시각을 본다
  if (!isWithinAvailableHours({ serviceId, startAt, endAt, availableHours })) {
    errors.push(AVAILABILITY_ERROR);
  }

  // 4. 중복 — 맞닿기만 한 경우는 통과시킨다(isOverlapping 이 처리)
  const hasOverlap = sitterReservations.some((reservation) =>
    isOverlapping(reservation.startAt, reservation.endAt, startAt, endAt)
  );
  if (hasOverlap) {
    errors.push(OVERLAP_ERROR);
  }

  return errors;
}

export {
  MIN_DAYS_AHEAD,
  MAX_DAYS_AHEAD,
  DAY_OFF_MESSAGE,
  findAvailableHour,
  getEndAt,
  usesDropOffPickUp,
  getMaxReservationQuantity,
  isWithinAvailableHours,
  getReservationErrors
};
