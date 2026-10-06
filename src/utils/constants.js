// 공통 고정 상수. 규칙이 한 곳에만 있어야 하는 값이다.

const STORAGE_KEY = 'pettopia.store.v1';

// 무한 스크롤 한 묶음
const CHUNK_SIZE = 12;

const PAGE_SIZE = 10;

// 배송비 판정은 할인 후 상품금액을 기준으로 한다
const FREE_SHIPPING_MIN = 30000;
const SHIPPING_FEE = 3000;

const MAX_QUANTITY = 99;

// 적용 동물 표시 문구. 값은 DOG·CAT 둘뿐인 고정 enum 이라 mocks 조회 대상이 아니다.
// 상품 카드·펫시터 카드·필터가 같이 쓰므로 여기 둔다.
const PET_TYPE_LABELS = {
  DOG: '강아지',
  CAT: '고양이'
};

export {
  STORAGE_KEY,
  CHUNK_SIZE,
  PAGE_SIZE,
  FREE_SHIPPING_MIN,
  SHIPPING_FEE,
  MAX_QUANTITY,
  PET_TYPE_LABELS
};
