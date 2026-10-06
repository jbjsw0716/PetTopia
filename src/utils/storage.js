// localStorage 접근을 여기 하나로 모은다.
// 화면이나 컴포넌트가 localStorage 를 직접 부르지 않는다.
//
// 이 파일이 하는 일은 셋이다 — 읽기 · 쓰기 · 구조 검사.
// 저장 순서(다음 데이터 구성 → 저장 성공 → 확정 상태 갱신 → 안내)를 지키는 것은
// 변경 함수를 가진 Layout 의 몫이다. 여기는 "저장이 됐는가" 만 돌려준다.
//
// 화면 문구를 여기 두지 않는다. 같은 저장 실패라도 담기·변경·초기화의 안내가 다르다.

import {
  FREE_SHIPPING_MIN,
  MAX_QUANTITY,
  SHIPPING_FEE,
  STORAGE_KEY
} from './constants.js';
import { getDiscountAmount, getReservationAmount } from './money.js';
import { initialStore } from './initialStore.js';

// 최상위는 열 키다.
// 처음 여덟 키(version · profile · 아래 배열 여섯)는 반드시 있어야 한다.
// 구현하지 않은 차수의 키도 처음부터 둔다. 나중에 키를 추가하면 이미 저장된 데이터에
// 그 키가 없어 복원 검사가 실패한다.
// 뒤에 생긴 두 칸(productReviews · promotionHiddenUntil)은 그래서 없어도 된다 —
// 두 칸이 생기기 전에 저장된 데이터가 있어 loadStore 가 빈 값으로 채워 연다.
const ARRAY_KEYS = [
  'cartItems',
  'orders',
  'reservations',
  'reviews',
  'inquiries',
  'wishlistProductIds'
];

const STORE_VERSION = 1;

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFilledString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

// 읽을 수 있는 일시인가 (시간대를 포함한 ISO 8601).
// 형식을 글자 단위로 따지지 않고 해석되는지만 본다. 과거 기록을 지금 기준으로
// 다시 판정하지 않는다는 태도다.
function isValidDateTime(value) {
  return isFilledString(value) && !Number.isNaN(Date.parse(value));
}

function isValidProfile(profile) {
  if (!isObject(profile)) {
    return false;
  }
  if (!isFilledString(profile.name)) {
    return false;
  }
  if (!isFilledString(profile.phone)) {
    return false;
  }
  if (!isFilledString(profile.address)) {
    return false;
  }
  return isObject(profile.pet);
}

// 여기서 보는 것은 저장 구조다. "mock 에 그 productId 가 있는가" 는 보지 않는다.
// 상품이 사라진 것은 구조 오류가 아니라 구매 불가 항목이고, 화면이 따로 표시한다.
function isValidCartItems(cartItems) {
  const seenIds = [];

  for (const item of cartItems) {
    if (!isObject(item)) {
      return false;
    }
    if (!isFilledString(item.productId)) {
      return false;
    }
    // 배열 안에서 중복 금지 — 같은 상품은 수량을 합산해 한 항목으로 둔다
    if (seenIds.includes(item.productId)) {
      return false;
    }
    seenIds.push(item.productId);

    if (!Number.isInteger(item.quantity)) {
      return false;
    }
    if (item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      return false;
    }
  }

  return true;
}

// 여기서 보는 것도 저장 구조다. "mock 에 그 productId 가 있는가" 는 보지 않는다.
// 상품이 사라진 것은 구조 오류가 아니라 '상품 정보 없음' 카드와 해제 버튼을 보이는
// 찜한 상품 화면의 일이다 — cartItems 와 같은 태도다.
function isValidWishlistProductIds(wishlistProductIds) {
  const seenIds = [];

  for (const productId of wishlistProductIds) {
    if (!isFilledString(productId)) {
      return false;
    }
    // 같은 id 가 두 번 들어가지 않는다 — 등록은 한 번만 반영한다
    if (seenIds.includes(productId)) {
      return false;
    }
    seenIds.push(productId);
  }

  return true;
}

// 연락처의 형식은 보지 않는다. 빈 값인지만 본다.
// 연락처 형식 검사를 붙이기 전에 저장된 연락처도 유효한 기록이다 — "나중에 연락처 형식 검사를
// 붙였다는 이유로 과거 연락처를 지우지 않는다". 형식 검사는 새 입력에만 쓰고
// (utils/phone.js), 여기는 이미 저장된 기록의 구조만 본다. 둘을 구분한다.
function isValidShipping(shipping) {
  if (!isObject(shipping)) {
    return false;
  }
  if (!isFilledString(shipping.recipientName)) {
    return false;
  }
  if (!isFilledString(shipping.phone)) {
    return false;
  }
  return isFilledString(shipping.address);
}

// 절사 규칙이 money.js 에만 있으므로 검사도 그 함수를 부른다.
// 여기에 Math.floor 를 다시 쓰면 계산식이 두 곳에 생긴다.
function isValidOrderItems(items) {
  const seenProductIds = [];

  for (const item of items) {
    if (!isObject(item)) {
      return false;
    }
    if (!isFilledString(item.productId)) {
      return false;
    }
    // 한 주문 안에서 같은 상품이 두 줄로 나뉘지 않는다
    if (seenProductIds.includes(item.productId)) {
      return false;
    }
    seenProductIds.push(item.productId);

    // 주문 시점의 상품명. 지금 mockProducts 의 이름과 같은지는 보지 않는다
    if (!isFilledString(item.name)) {
      return false;
    }
    if (!isNonNegativeInteger(item.unitPrice)) {
      return false;
    }
    if (
      !Number.isInteger(item.discountPercent) ||
      item.discountPercent < 0 ||
      item.discountPercent > 100
    ) {
      return false;
    }
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY
    ) {
      return false;
    }
    if (
      item.discountAmount !==
      getDiscountAmount(item.unitPrice, item.discountPercent, item.quantity)
    ) {
      return false;
    }
    if (item.lineTotal !== item.unitPrice * item.quantity - item.discountAmount) {
      return false;
    }
  }

  return true;
}

// 여기서 보는 것은 저장 구조와 금액의 앞뒤가 맞는가다. "지금 mockProducts 에 그 상품이
// 있는가" 나 "지금 가격과 같은가" 는 보지 않는다. 과거 기록을 지금 기준으로 다시 판정하면
// 정상인 과거 주문이 복원 실패가 된다.
function isValidOrders(orders) {
  const seenIds = [];

  for (const order of orders) {
    if (!isObject(order)) {
      return false;
    }
    if (!isFilledString(order.id)) {
      return false;
    }
    if (seenIds.includes(order.id)) {
      return false;
    }
    seenIds.push(order.id);

    if (!isValidDateTime(order.orderedAt)) {
      return false;
    }
    if (order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
      return false;
    }
    if (!isValidShipping(order.shipping)) {
      return false;
    }
    // 항목이 하나도 없는 주문은 만들 수 없다
    if (!Array.isArray(order.items) || order.items.length === 0) {
      return false;
    }
    if (!isValidOrderItems(order.items)) {
      return false;
    }

    // 합계가 항목과 맞는가
    let subtotal = 0;
    let discountTotal = 0;

    for (const item of order.items) {
      subtotal += item.unitPrice * item.quantity;
      discountTotal += item.discountAmount;
    }

    if (order.subtotal !== subtotal) {
      return false;
    }
    if (order.discountTotal !== discountTotal) {
      return false;
    }
    if (order.shippingFee !== 0 && order.shippingFee !== SHIPPING_FEE) {
      return false;
    }
    // 배송비는 한 방향으로만 본다 — 3,000원이면 할인 후 상품금액이 30,000원 미만이어야 한다.
    // 반대로 "0원인데 30,000원 미만이다" 를 오류로 보지 않는다. 0원 배송비는 그때의 설정이
    // 만든 값이고, "과거의 0원 배송비는 이후 설정이 바뀌어도 유지한다".
    // 양쪽을 다 검사하면 배송비 규칙을 바꾸는 순간 정상 과거 주문이 전부 복원 실패가 된다.
    if (
      order.shippingFee === SHIPPING_FEE &&
      subtotal - discountTotal >= FREE_SHIPPING_MIN
    ) {
      return false;
    }
    if (order.totalAmount !== subtotal - discountTotal + order.shippingFee) {
      return false;
    }

    // 취소 상태
    if (order.status === 'COMPLETED' && order.cancelledAt !== null) {
      return false;
    }
    if (order.status === 'CANCELLED') {
      if (!isValidDateTime(order.cancelledAt)) {
        return false;
      }
      // 주문보다 앞선 취소 일시는 있을 수 없다
      if (Date.parse(order.cancelledAt) < Date.parse(order.orderedAt)) {
        return false;
      }
    }
  }

  return true;
}

// 여기서 보는 것은 저장 구조와 금액·시각의 앞뒤다.
// 종료 일시를 지금 서비스 시간(durationMinutes)으로 다시 계산해 맞춰 보지는 않는다.
// 서비스 시간을 바꾸는 순간 정상 과거 예약이 모두 복원 실패가 된다.
// "지금 그 펫시터·서비스가 있는가" 도 보지 않는다. 과거 기록을 지금 기준으로 다시 판정하지 않는다.
function isValidReservations(reservations) {
  const seenIds = [];

  for (const reservation of reservations) {
    if (!isObject(reservation)) {
      return false;
    }
    if (!isFilledString(reservation.id)) {
      return false;
    }
    if (seenIds.includes(reservation.id)) {
      return false;
    }
    seenIds.push(reservation.id);

    if (reservation.status !== 'COMPLETED' && reservation.status !== 'CANCELLED') {
      return false;
    }

    // 금액 = 요금 × 수량. 계산식은 money.js 한 곳에만 있으므로 그 함수를 부른다
    if (!isNonNegativeInteger(reservation.unitPrice)) {
      return false;
    }
    if (!Number.isInteger(reservation.quantity) || reservation.quantity < 1) {
      return false;
    }
    if (
      reservation.totalAmount !==
      getReservationAmount(reservation.unitPrice, reservation.quantity)
    ) {
      return false;
    }

    // 시작이 종료보다 앞선다. 둘 다 읽을 수 있는 일시여야 비교할 수 있다
    if (!isValidDateTime(reservation.startAt) || !isValidDateTime(reservation.endAt)) {
      return false;
    }
    if (Date.parse(reservation.startAt) >= Date.parse(reservation.endAt)) {
      return false;
    }

    // 취소 상태 — 주문과 같은 모양이다
    if (reservation.status === 'COMPLETED' && reservation.cancelledAt !== null) {
      return false;
    }
    if (reservation.status === 'CANCELLED' && !isValidDateTime(reservation.cancelledAt)) {
      return false;
    }
  }

  return true;
}

// 여기서 보는 것은 저장 구조다.
// 제목·내용 글자 수는 보지 않는다. 그것은 새 입력 검사(Layout 의 addInquiry)의 일이다.
// 저장된 문의만 들어 있다. mock 초기 문의(Q001~)는 저장소에 들어오지 않는다.
function isValidInquiries(inquiries) {
  const seenIds = [];

  for (const inquiry of inquiries) {
    if (!isObject(inquiry)) {
      return false;
    }
    if (!isFilledString(inquiry.id)) {
      return false;
    }
    if (seenIds.includes(inquiry.id)) {
      return false;
    }
    seenIds.push(inquiry.id);

    if (inquiry.status !== 'RECEIVED' && inquiry.status !== 'ANSWERED') {
      return false;
    }
    if (
      inquiry.status === 'RECEIVED' &&
      (inquiry.answer !== null || inquiry.answeredAt !== null)
    ) {
      return false;
    }
  }

  return true;
}

// 여기서 보는 것은 저장 구조다.
// 글자 수(10~500자)는 보지 않는다. 그것은 새 입력 검사(utils/review.js)의 일이다 —
// 연락처 형식을 새 입력에만 보는 isValidShipping 과 같은 태도다.
// "지금 그 예약·펫시터가 있는가" 도 보지 않는다. 과거 기록을 지금 기준으로 다시 판정하지 않는다.
//
// 여기 있는 것은 저장된 후기뿐이라 reservationId 는 늘 문자열이다.
// mock 후기(reservationId null)는 저장소에 들어오지 않는다.
function isValidReviews(reviews) {
  const seenIds = [];
  const seenReservationIds = [];

  for (const review of reviews) {
    if (!isObject(review)) {
      return false;
    }
    if (!isFilledString(review.id)) {
      return false;
    }
    if (seenIds.includes(review.id)) {
      return false;
    }
    seenIds.push(review.id);

    // 같은 예약으로 쓴 후기가 둘 이상이면 안 된다
    if (!isFilledString(review.reservationId)) {
      return false;
    }
    if (seenReservationIds.includes(review.reservationId)) {
      return false;
    }
    seenReservationIds.push(review.reservationId);

    // 평점 평균(utils/rating.js)과 이용 후기 분류가 이 셋으로 센다. 빠지면 후기가 어디에도 잡히지 않는다
    if (!isFilledString(review.sitterId)) {
      return false;
    }
    if (!isFilledString(review.serviceId)) {
      return false;
    }
    if (!isFilledString(review.petType)) {
      return false;
    }

    if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
      return false;
    }
    if (!isFilledString(review.content)) {
      return false;
    }
    if (!isValidDateTime(review.writtenAt)) {
      return false;
    }
  }

  return true;
}

// 상품 리뷰. 저장된 리뷰만 들어 있다 — 처음부터 있는 리뷰 156건은 mock 이다.
//
// 여기서 보는 것은 저장 구조다.
// 글자 수(10~1,000자)는 보지 않는다. 그것은 새 입력 검사(Layout 의 addProductReview)의 일이다.
// "지금 그 상품이 있는가" 도 보지 않는다. 과거 기록을 지금 기준으로 다시 판정하지 않는다.
function isValidProductReviews(productReviews) {
  const seenIds = [];

  for (const review of productReviews) {
    if (!isObject(review)) {
      return false;
    }
    if (!isFilledString(review.id)) {
      return false;
    }
    // 목록이 id 를 key 로 그린다. 겹치면 리뷰 하나가 화면에서 사라진다
    if (seenIds.includes(review.id)) {
      return false;
    }
    seenIds.push(review.id);

    if (!isFilledString(review.productId)) {
      return false;
    }
    if (!isFilledString(review.author)) {
      return false;
    }
    if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
      return false;
    }
    if (!isFilledString(review.content)) {
      return false;
    }
    if (!isValidDateTime(review.writtenAt)) {
      return false;
    }
  }

  return true;
}

// 홈 팝업 '오늘 하루 보지 않기'. null 이거나 읽을 수 있는 일시다.
// 지난 일시도 정상이다 — 자정이 지나면 팝업이 다시 뜰 뿐 저장 데이터의 오류가 아니다.
function isValidPromotionHiddenUntil(value) {
  return value === null || isValidDateTime(value);
}

// 모든 칸을 항목까지 본다. 하나라도 어긋나면 저장 데이터 전체가 복원 실패다.
function isValidStore(store) {
  if (!isObject(store)) {
    return false;
  }
  if (store.version !== STORE_VERSION) {
    return false;
  }
  // 처음 여덟 키가 하나라도 빠지면 실패다. 임의로 채워 넣지 않는다
  if (!isValidProfile(store.profile)) {
    return false;
  }
  for (const key of ARRAY_KEYS) {
    if (!Array.isArray(store[key])) {
      return false;
    }
  }

  if (!isValidCartItems(store.cartItems)) {
    return false;
  }
  if (!isValidWishlistProductIds(store.wishlistProductIds)) {
    return false;
  }
  if (!isValidReviews(store.reviews)) {
    return false;
  }
  if (!isValidReservations(store.reservations)) {
    return false;
  }
  if (!isValidInquiries(store.inquiries)) {
    return false;
  }

  // 뒤에 생긴 두 칸은 없어도 된다(위 ARRAY_KEYS 주석). 있는데 모양이 틀리면 다른 칸처럼 복원 실패다
  if (store.productReviews !== undefined) {
    if (!Array.isArray(store.productReviews)) {
      return false;
    }
    if (!isValidProductReviews(store.productReviews)) {
      return false;
    }
  }
  if (
    store.promotionHiddenUntil !== undefined &&
    !isValidPromotionHiddenUntil(store.promotionHiddenUntil)
  ) {
    return false;
  }

  return isValidOrders(store.orders);
}

// 복사본을 돌려준다. import 한 원본을 직접 바꾸지 않는다.
function createDefaultStore() {
  return JSON.parse(JSON.stringify(initialStore));
}

// 돌려주는 status 는 ready 또는 error 다. loading 이 없는 이유는 localStorage 가
// 기다림 없이 읽히기 때문이다 — 부르는 쪽이 useState 초기화 함수에서 부르면
// 첫 렌더부터 결과가 정해져 있고, "읽는 중에 빈 상태로 판단하지 않는다"가
// 저절로 지켜진다. 없는 지연을 지어내지 않는다.
//
// error 일 때도 store 를 기본값으로 채워 돌려준다. 화면이 값이 없어 깨지지 않게
// 하려는 것이고, 저장소의 원본은 건드리지 않는다. 저장이 필요한 동작을 막는 것은
// 부르는 쪽이 status 로 판단한다.
function loadStore() {
  let saved;

  // 저장소 접근 자체가 막힐 수 있다. 데이터가 없는 경우와 구분한다
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'error', store: createDefaultStore() };
  }

  // 키가 없으면 오류가 아니다. 첫 방문이므로 기본값으로 시작한다.
  // 여기서 저장하지 않는다 — 사용자가 무언가를 바꿀 때 저장된다.
  if (saved === null) {
    return { status: 'ready', store: createDefaultStore() };
  }

  let parsed;

  // 빈 문자열과 JSON 의 null 은 정상 기본값으로 보지 않는다
  try {
    parsed = JSON.parse(saved);
  } catch {
    return { status: 'error', store: createDefaultStore() };
  }

  if (!isValidStore(parsed)) {
    return { status: 'error', store: createDefaultStore() };
  }

  // 뒤에 생긴 두 칸이 없는 옛 데이터는 빈 값으로 보고 연다.
  // 처음 여덟 키와 달리 채워 넣는다 — 두 칸이 생기기 전에 저장된 데이터도 정상 기록이다.
  // 화면과 변경 함수는 늘 열 키를 받고, 다음 저장 때 열 키로 함께 저장된다.
  return {
    status: 'ready',
    store: {
      ...parsed,
      productReviews: parsed.productReviews === undefined ? [] : parsed.productReviews,
      promotionHiddenUntil:
        parsed.promotionHiddenUntil === undefined ? null : parsed.promotionHiddenUntil
    }
  };
}

// JSON 변환도 실패할 수 있어 쓰기와 같은 try 안에 둔다.
function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// isValidReviews 도 내보낸다 — Layout 의 addReview 가 저장 직전에 같은 검사를 한 번 더 한다.
// saveStore 는 구조를 보지 않으므로 "저장 성공" 이 "다음에 복원 가능" 을 뜻하지 않는다.
// 복원 검사에 걸릴 후기를 저장하면 새로고침 뒤 저장 데이터 전체를 읽지 못하게 된다.
export { createDefaultStore, isValidReviews, loadStore, saveStore };
