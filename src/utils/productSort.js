import { getDiscountedPrice } from './money.js';
import { getProductRating } from './productRating.js';
// 상품 목록과 기획전은 같은 정렬 규칙을 사용한다.
// reviews 는 부르는 화면이 넘긴다 — Layout 이 합친 allProductReviews 다.
// 기본값을 두지 않는다. 기본값이 있으면 저장된 리뷰가 빠진 채로 조용히 정렬될 수 있다.
// 가격 정렬은 카드에 크게 보이는 할인가로 한다. 정가로 줄 세우면 화면의 가격이
// 오르내려 정렬이 고장 난 것처럼 보였다. 무료배송 판정도 할인 후 금액이다.
// 같은 값이면 이름 → ID 순으로 가른다(이름순도 같은 이름이면 ID) — 정렬 결과가 매번 같아야 한다.
const PRODUCT_SORT_OPTIONS = [
  { value: 'default', label: '기본' },
  { value: 'ratingDesc', label: '평점 높은 순' },
  { value: 'ratingAsc', label: '평점 낮은 순' },
  { value: 'priceAsc', label: '낮은 가격' },
  { value: 'priceDesc', label: '높은 가격' },
  { value: 'nameAsc', label: '이름' }
];

function sortProducts(products, sortType, reviews) {
  const sorted = [...products];
  const byName = (a, b) => a.name.localeCompare(b.name, 'ko') || a.id.localeCompare(b.id);
  const shownPrice = (product) => getDiscountedPrice(product.price, product.discountPercent);
  if (sortType === 'priceAsc') sorted.sort((a, b) => shownPrice(a) - shownPrice(b) || byName(a,b));
  if (sortType === 'priceDesc') sorted.sort((a, b) => shownPrice(b) - shownPrice(a) || byName(a,b));
  if (sortType === 'nameAsc') sorted.sort(byName);
  if (sortType === 'ratingAsc' || sortType === 'ratingDesc') {
    const ratings = new Map(products.map((product) => [product.id, getProductRating(reviews, product.id)]));
    sorted.sort((a,b) => {
      const left = ratings.get(a.id), right = ratings.get(b.id);
      const difference = (left.average ?? 0) - (right.average ?? 0);
      return (sortType === 'ratingAsc' ? difference : -difference) || byName(a,b);
    });
  }
  return sorted;
}

export { PRODUCT_SORT_OPTIONS, sortProducts };
