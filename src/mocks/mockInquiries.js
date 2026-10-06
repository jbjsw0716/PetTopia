// 읽기 전용이다. 저장된 inquiries 와 합쳐 표시한다.
// 새로 등록한 문의는 항상 RECEIVED 라, ANSWERED 상태는 이 mock 없이는 화면에서 볼 수 없다.

const mockInquiries = [
  { id: 'Q001', faqCategoryId: 'ORDER', title: '배송비 계산이 궁금합니다', content: '할인 적용 후 금액 기준으로 배송비가 계산되나요?', createdAt: '2026-09-10T11:00:00+09:00', status: 'ANSWERED', answer: '네, 할인 적용 후 상품 금액을 기준으로 계산됩니다. 30,000원 이상이면 무료 배송입니다.', answeredAt: '2026-09-10T15:20:00+09:00' },
  { id: 'Q002', faqCategoryId: 'RESERVATION', title: '펫시터 예약 변경 문의', content: '예약한 시간을 변경하고 싶은데 어떻게 해야 하나요?', createdAt: '2026-09-14T09:30:00+09:00', status: 'RECEIVED', answer: null, answeredAt: null },
  { id: 'Q003', faqCategoryId: 'ORDER', title: '주문 내역 확인 문의', content: '주문한 상품과 금액은 어디에서 다시 볼 수 있나요?', createdAt: '2026-09-05T13:00:00+09:00', status: 'ANSWERED', answer: '주문 내역 화면(헤더의 Orders 또는 마이페이지의 주문 내역)에서 주문 상세 보기를 누르면 주문한 상품과 금액, 배송 정보를 다시 볼 수 있습니다.', answeredAt: '2026-09-05T17:45:00+09:00' },
  { id: 'Q004', faqCategoryId: 'MEMBER', title: '반려동물 정보 수정 문의', content: '마이페이지에서 반려동물 정보를 수정할 수 있나요?', createdAt: '2026-09-17T10:10:00+09:00', status: 'RECEIVED', answer: null, answeredAt: null },
  { id: 'Q005', faqCategoryId: 'ETC', title: '영업시간 문의', content: '고객센터 상담 가능 시간이 어떻게 되나요?', createdAt: '2026-09-18T16:40:00+09:00', status: 'RECEIVED', answer: null, answeredAt: null }
];

export { mockInquiries };
