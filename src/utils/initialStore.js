// mock 파일과는 별도다 (과거 예약은 mock 이 아니라 저장소 초기값이다).
// 후기 작성을 보여주려면 이미 끝난 예약이 필요한데, 예약은 내일~30일 뒤에만
// 만들 수 있어 사용자가 직접 만들 수 없다. 그래서 RS000 을 기본값에 미리 넣어 둔다.
//
// RS000 은 날짜를 고정한다 (요일별로 두는 펫시터 이용 가능 시간과 다르다) — 과거는
// 계속 과거여야 하기 때문이다.
//
// 열 키를 처음부터 둔다. 뒤 두 칸 — 상품 리뷰(productReviews)와
// 홈 팝업 '오늘 하루 보지 않기'(promotionHiddenUntil, 그날 자정 일시 또는 null) — 은 나중에
// 생긴 칸이라, 두 칸이 없는 옛 저장 데이터는 storage.js 가 빈 값으로 보고 연다.

import { mockProfile } from '../mocks/mockProfile.js';

const initialStore = {
  version: 1,
  profile: mockProfile,
  cartItems: [],
  orders: [],
  reservations: [
    {
      id: 'RS000',
      reservedAt: '2026-08-18T10:00:00+09:00',
      status: 'COMPLETED',
      sitterId: 'PS001',
      sitterName: '이돌봄',
      serviceId: 'WALK',
      serviceName: '산책',
      unitPrice: 15000,
      unit: 'HOUR',
      unitLabel: '시간',
      quantity: 2,
      totalAmount: 30000,
      startAt: '2026-08-22T10:00:00+09:00',
      endAt: '2026-08-22T12:00:00+09:00',
      pet: {
        name: '콩이',
        petType: 'DOG',
        age: 3,
        note: '낯선 사람을 조금 경계합니다'
      },
      cancelledAt: null
    }
  ],
  reviews: [],
  inquiries: [],
  wishlistProductIds: [],
  productReviews: [],
  promotionHiddenUntil: null
};

export { initialStore };
