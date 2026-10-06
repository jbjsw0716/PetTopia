import { mockProducts } from './mockProducts.js';

// 사용자 작성 후기는 별도 저장하며 덮어쓰지 않는다.
const authors = ['박다솜', '이하늘', '최유진', '정민서', '윤지우', '한서준', '오수빈', '강도윤', '임소연', '송지호', '문채원', '배하린'];
const contents = {
  FOOD: ['알갱이 크기가 적당해서 먹기 편해 보여요. 기존 사료와 섞어 급여하고 있어요.', '밀봉해서 보관하기 편하고 식사 시간에 잘 먹네요. 조금 더 급여해 보려고 합니다.'],
  SNACK: ['작게 나누어 주기 좋아서 훈련할 때 활용하고 있어요.', '봉지를 꺼내면 먼저 다가와요. 양을 조절해서 간식으로 주고 있습니다.'],
  TOY: ['함께 놀아주기 좋고 아이가 관심을 보여요. 놀이 시간이 즐거워졌습니다.', '생각보다 가벼워서 보관하기 편해요. 내구성은 조금 더 써봐야겠어요.'],
  HYGIENE: ['일상 관리에 잘 사용하고 있어요. 사용 후 정리도 어렵지 않았습니다.', '크기와 구성이 설명과 같아요. 우리 아이 용품으로 잘 쓰고 있습니다.'],
  OUTDOOR: ['크기를 확인하고 주문했더니 잘 맞아요. 외출할 때 유용하게 쓰고 있어요.', '마감이 깔끔하고 색상도 마음에 들어요. 산책 준비가 편해졌습니다.'],
  LITTER: ['화장실 정리할 때 사용하기 편해요. 아이도 낯설어하지 않고 잘 이용합니다.', '설명된 크기와 같고 보관하기 괜찮아요. 조금 더 사용해 볼 생각입니다.'],
  TOWER: ['아이가 올라가서 쉬는 시간이 많아졌어요. 집 안에 두기도 잘 어울립니다.', '처음에는 낯설어했는데 지금은 잘 사용해요. 설치할 공간을 미리 확인하면 좋아요.']
};
const experiences = ['포장이 깔끔하게 도착했고 설명과 구성이 같았습니다.', '며칠 사용해 보니 일상에서 손이 자주 가네요.', '다음에도 같은 제품으로 주문할 생각입니다.', '가격과 구성을 비교하고 골랐는데 만족스럽습니다.', '처음 사용하는 제품이라 적응하는 시간을 두고 있어요.', '크기와 사용 방법을 미리 확인한 것이 도움이 됐어요.'];
// 번호 머리글자는 RVP(상품 리뷰)다 — 기획전이 PR001~ 을 쓴다.
// 'RVP-DEMO-P001-1' 은 머리글자 뒤가 숫자가 아니라서 사용자 리뷰 번호(RVP001~) 셈에 들어가지 않는다.
const mockProductReviews = mockProducts.slice(0, 26).flatMap((product, productIndex) =>
  Array.from({ length: 6 }, (_, index) => ({
    id: `RVP-DEMO-${product.id}-${index + 1}`, productId: product.id,
    author: authors[(index + productIndex) % authors.length], rating: [5,4,5,3,4,5][(index + productIndex) % 6],
    content: contents[product.categoryId][index % 2] + ' ' + experiences[index],
    writtenAt: `2026-09-${String(12 + index).padStart(2,'0')}T10:00:00+09:00`
  }))
);

export { mockProductReviews };
