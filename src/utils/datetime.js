// 주문 일시를 주문 완료와 주문 내역 두 화면이 같은 모양으로 보여야 하는데, 서식을 화면마다 쓰면
// 두 곳에 같은 코드가 생긴다 (같은 계산이 두 곳에 생기면 갈라진다).
// money.js 가 formatWon 을 갖는 것과 같은 이유다.
//
// 예약 업무 규칙은 utils/reservation.js 가 갖고 이 파일에는 그 판정이 필요로 하는 순수 날짜·시간 계산만 둔다.

// 저장된 ISO 8601 문자열을 2026-09-18 14:30 모양으로 보인다. 보는 사람의 시간대로 표시한다.
//
// 읽을 수 없는 값이면 저장된 문자열을 그대로 돌려준다. 값이 어긋난 것을 화면에서
// 알아볼 수 있어야 하고, 지어낸 날짜로 덮지 않는다 (StatusBadge 가 모르는 상태를
// 그대로 보이는 것과 같은 판단).
function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return (
    date.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + minutes
  );
}

// <input type="date"> 의 value 모양(YYYY-MM-DD)으로 바꾼다. 로컬 날짜 성분으로 만든다 —
// toISOString 은 UTC 라 자정 근처(KST)에서 날짜가 하루 밀릴 수 있다.
function formatDateInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

// 요일 키 배열 — mock 펫시터의 availableHours[].day 와 같은 값이다.
// 순서는 Date.getDay() 의 번호(일요일 0)를 따른다. 화면에 보이는 월~일 순서는 utils/schedule.js 가 갖는다.
const WEEKDAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function addMinutes(isoString, minutes) {
  const date = new Date(isoString);
  return new Date(date.getTime() + minutes * 60000).toISOString();
}

// 로컬 기준 요일 키. 이용 가능 시간을 찾을 때 이 값으로 availableHours 를 찾는다.
function getWeekdayKey(isoString) {
  return WEEKDAY_KEYS[new Date(isoString).getDay()];
}

// 로컬 'HH:MM' — mock 의 startTime·endTime 과 같은 모양이라 문자열 그대로 비교할 수 있다.
function getTimeOfDay(isoString) {
  const date = new Date(isoString);
  return (
    String(date.getHours()).padStart(2, '0') +
    ':' +
    String(date.getMinutes()).padStart(2, '0')
  );
}

// 시각을 버리고 자정 기준 타임스탬프로 바꾼다 — 날짜 단위 비교에 쓴다.
function getDateOnlyTime(isoString) {
  const date = new Date(isoString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// 겹침 판정식 — 맞닿기만 한 경우(앞 예약 종료 = 뒤 예약 시작)는 겹침이 아니다.
function isOverlapping(existingStartAt, existingEndAt, newStartAt, newEndAt) {
  return (
    new Date(existingStartAt).getTime() < new Date(newEndAt).getTime() &&
    new Date(newStartAt).getTime() < new Date(existingEndAt).getTime()
  );
}

export {
  WEEKDAY_KEYS,
  formatDateTime,
  formatDateInputValue,
  addMinutes,
  getWeekdayKey,
  getTimeOfDay,
  getDateOnlyTime,
  isOverlapping
};
