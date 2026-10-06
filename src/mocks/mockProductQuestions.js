// 읽기 전용이다.
//
// 모든 상품에 같은 6건을 보인다. 목록의 key 는 화면이 상품 id 를 앞에 붙여 만든다 (예: P001-PQ01).
// 상품 문의 = 1:1 문의 + productId 다 — 상품에서 들어가 남긴 내 1:1 문의가 이 예시와 함께 보인다.
// answer 가 null 이면 '답변확인중' 이고, isPrivate 인 글은 제목·내용을 가리고 작성자 첫 글자만 보인다.

const mockProductQuestions = [
  {
    id: 'PQ01',
    category: '배송',
    title: '지금 주문하면 언제 출고되나요?',
    content: '주말에 사용하려고 하는데 출고 일정이 궁금합니다.',
    answer: '주문 확인 후 순차적으로 출고됩니다. 출고 후 도착 일정은 배송 지역과 택배사 사정에 따라 달라질 수 있습니다.',
    author: '봄이맘',
    createdAt: '2026-09-21T10:00:00+09:00',
    isPrivate: false
  },
  {
    id: 'PQ02',
    category: '상품',
    title: '상품 보관 방법을 알려주세요.',
    content: '개봉 후 어떻게 보관하면 좋을까요?',
    answer: '직사광선과 습기를 피해 보관해 주세요. 식품은 개봉 후 밀봉하고, 제품 포장에 기재된 보관 방법과 사용 기한을 확인해 주세요.',
    author: '초코집사',
    createdAt: '2026-09-20T10:00:00+09:00',
    isPrivate: false
  },
  {
    id: 'PQ03',
    category: '교환/반품',
    title: '다른 상품으로 교환하고 싶어요.',
    content: '아직 개봉하지 않았는데 교환 절차를 알고 싶습니다.',
    answer: null,
    author: '민지',
    createdAt: '2026-09-19T10:00:00+09:00',
    isPrivate: false
  },
  {
    id: 'PQ04',
    category: '배송',
    title: '배송지 확인 부탁드립니다.',
    content: '',
    answer: null,
    author: '하늘',
    createdAt: '2026-09-18T10:00:00+09:00',
    isPrivate: true
  },
  {
    id: 'PQ05',
    category: '상품',
    title: '상세 설명과 같은 구성으로 오나요?',
    content: '추가로 준비해야 하는 물품이 있는지 궁금합니다.',
    answer: '기본 구성은 상품 상세 안내를 기준으로 확인해 주세요. 연출용 소품은 포함되지 않으며, 궁금한 구성품을 남겨주시면 자세히 안내드리겠습니다.',
    author: '두부네',
    createdAt: '2026-09-17T10:00:00+09:00',
    isPrivate: false
  },
  {
    id: 'PQ06',
    category: '기타',
    title: '여러 개 주문하려고 합니다.',
    content: '묶음으로 주문해도 될까요?',
    answer: '장바구니에서 수량을 선택해 함께 주문할 수 있습니다. 필요한 수량을 확인한 뒤 주문해 주세요.',
    author: '소담',
    createdAt: '2026-09-16T10:00:00+09:00',
    isPrivate: false
  }
];

export { mockProductQuestions };
