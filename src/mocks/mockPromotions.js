import { mockProducts } from './mockProducts.js';

// 상품을 복제하지 않고 ID만 묶는다. 가격과 할인율은 상품 원본이 기준이다.
const mockPromotions = [
  {
    id: 'PR001', title: '함께 걷는 가을',
    imageUrl: '/images/기획전1.png',
    imageAlt: '가을 산책길에서 하네스를 착용하고 보호자와 걷는 웰시코기',
    description: '선선한 바람을 따라, 산책과 놀이 시간을 더 즐겁게 만드는 용품을 만나보세요.',
    productIds: mockProducts.filter((product) => ['OUTDOOR', 'TOY'].includes(product.categoryId)).map((product) => product.id)
  },
  {
    id: 'PR002', title: '맛있는 하루의 시작',
    imageUrl: '/images/기획전2.png',
    imageAlt: '사료와 간식이 놓인 그릇 앞에서 식사를 기다리는 강아지',
    description: '매일 먹는 든든한 한 끼와 작은 보상. 우리 아이의 사료와 간식을 모았어요.',
    productIds: mockProducts.filter((product) => ['FOOD', 'SNACK'].includes(product.categoryId)).map((product) => product.id)
  },
  {
    id: 'PR003', title: '고양이의 편안한 공간',
    imageUrl: '/images/기획전3.png',
    imageAlt: '원목 캣타워의 쿠션 위에서 편안하게 쉬는 고양이',
    description: '포근하게 쉬고, 마음껏 오르고, 깔끔하게 생활하는 고양이의 일상을 준비해요.',
    productIds: mockProducts.filter((product) => product.petTypes.includes('CAT') && ['LITTER', 'TOWER', 'HYGIENE'].includes(product.categoryId)).map((product) => product.id)
  }
];

export { mockPromotions };
