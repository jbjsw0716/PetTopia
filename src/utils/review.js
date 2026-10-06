// F-25 후기 작성 판정.
//
// 예약 내역 · 마이페이지의 `후기 쓰기` 버튼, 후기 작성 화면의 진입 검사,
// Layout 의 addReview 재판정이 모두 이 파일의 함수를 부른다. 같은 계산이 두 곳에 생기면
// 갈라진다 (utils/reservation.js 와 같은 이유).
// 예약 등록 판정(utils/reservation.js)과 달리 저장된 reviews 까지 읽어야 해서 따로 둔다.

import { getDateOnlyTime } from './datetime.js';

// 내용 길이 — 앞뒤 공백을 제거한 뒤 센다. 오류 문구도 이 값에서 만든다
const REVIEW_CONTENT_MIN = 10;
const REVIEW_CONTENT_MAX = 500;

// 후기를 쓸 수 없는 이유. 쓸 수 있으면 null 이다.
// 'NOT_FOUND' | 'CANCELLED' | 'NOT_ENDED' | 'ALREADY_WRITTEN'
//
// 판정 순서가 곧 안내 순서다 — 없는 예약 → 취소 → 아직 이용이 끝나지 않음 → 이미 씀.
// 취소된 지난 예약은 `취소` 로, 이미 쓴 예약은 `이미 씀` 으로 안내하려면 이 순서여야 한다.
//
// storedReviews 는 저장된 reviews 만 넘긴다. mock 후기는 reservationId 가 전부 null 이라
// 내 예약의 중복 판정 대상이 아니다.
function getReviewBlockReason(reservation, storedReviews, nowIso) {
  if (!reservation) {
    return 'NOT_FOUND';
  }

  // 조건 1 — 예약 완료. 상태는 COMPLETED · CANCELLED 둘뿐이다
  if (reservation.status !== 'COMPLETED') {
    return 'CANCELLED';
  }

  // 조건 2 — 종료 일시의 날짜가 오늘보다 이전. 시각이 아니라 날짜로만 비교한다 —
  // 시각으로 비교하면 같은 날 오전과 오후에 결과가 달라진다.
  // `<` 가 참일 때만 통과시킨다. 종료 일시를 읽을 수 없으면(NaN) 비교가 거짓이라 막힌다
  if (!(getDateOnlyTime(reservation.endAt) < getDateOnlyTime(nowIso))) {
    return 'NOT_ENDED';
  }

  // 조건 3 — 예약 1건당 후기 1건
  if (storedReviews.some((review) => review.reservationId === reservation.id)) {
    return 'ALREADY_WRITTEN';
  }

  return null;
}

// 걸린 항목만 담은 객체를 돌려준다(fieldErrors 모양). 통과하면 빈 객체다.
// 후기 작성 화면은 항목별 문구로 쓰고, Layout 은 비었는지만 본다.
//
// 저장된 기록의 구조 검사(storage.js 의 isValidReviews)와 다르다 — 글자 수는 새 입력에만 본다.
function getReviewInputErrors(rating, content) {
  const errors = {};
  const text = content.trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = '평점을 선택해 주세요.';
  }

  if (text === '') {
    errors.content = '내용을 입력해 주세요.';
  } else if (text.length < REVIEW_CONTENT_MIN) {
    errors.content = '내용은 ' + REVIEW_CONTENT_MIN + '자 이상 입력해 주세요.';
  } else if (text.length > REVIEW_CONTENT_MAX) {
    errors.content = '내용은 ' + REVIEW_CONTENT_MAX + '자 이하로 입력해 주세요.';
  }

  return errors;
}

export { getReviewBlockReason, getReviewInputErrors };
