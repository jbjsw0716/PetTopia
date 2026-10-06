// petTypes 는 "이 분류를 어느 동물 메뉴 하위에 노출할지" 만 정한다.
// 상품 필터 판정에는 쓰지 않는다 (2축 식은 product.petTypes 를 본다).

const mockCategories = [
  { id: 'FOOD', name: '사료', petTypes: ['DOG', 'CAT'] },
  { id: 'SNACK', name: '간식', petTypes: ['DOG', 'CAT'] },
  { id: 'TOY', name: '장난감', petTypes: ['DOG', 'CAT'] },
  { id: 'HYGIENE', name: '위생용품', petTypes: ['DOG'] },
  { id: 'OUTDOOR', name: '의류·외출용품', petTypes: ['DOG'] },
  { id: 'LITTER', name: '모래·화장실', petTypes: ['CAT'] },
  { id: 'TOWER', name: '캣타워·스크래처', petTypes: ['CAT'] }
];

export { mockCategories };
