// 별도 mock 파일을 만들지 않는다 — FAQ와 1:1 문의가 같은 값을 공유한다.
// `전체` 는 여기에 넣지 않는다. 화면 필터의 선택값 `all` 로만 쓴다.

const FAQ_CATEGORIES = [
  { id: 'ORDER', name: '주문·배송' },
  { id: 'RESERVATION', name: '예약' },
  { id: 'PAYMENT', name: '결제' },
  { id: 'MEMBER', name: '회원' },
  { id: 'ETC', name: '기타' }
];

function getFaqCategoryName(categoryId) {
  const category = FAQ_CATEGORIES.find((item) => item.id === categoryId);
  return category ? category.name : '';
}

export { FAQ_CATEGORIES, getFaqCategoryName };
