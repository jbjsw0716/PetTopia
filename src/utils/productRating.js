// 상품 평점. 평균은 이 파일 한 곳에서만 계산한다.
//
// reviews 는 처음부터 있는 리뷰(mock)와 저장된 리뷰를 합친 배열이다 — Layout 이 한 번 합쳐
// Outlet context 로 내려 준다(allProductReviews). 화면이 이 함수로 계산해 카드에 숫자로 넘긴다
// (공통 UI 는 계산하지 않는다). 리뷰가 0건이면 평균이 없다(null) — 0.0 으로 적지 않는다.
//
// 펫시터 평점(utils/rating.js)과 같은 규칙이다 — 평균을 소수 첫째 자리로 반올림한다.
// 전에는 반올림 없이 넘기고 화면마다 toFixed(1) 을 해서, 같은 4.35 가 펫시터는 4.4, 상품은 4.3 이었다.

function getAverageRating(reviews) {
  if (reviews.length === 0) {
    return { count: 0, average: null };
  }
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return {
    count: reviews.length,
    average: Math.round((sum / reviews.length) * 10) / 10
  };
}

function getProductRating(reviews, productId) {
  return getAverageRating(reviews.filter((review) => review.productId === productId));
}

export { getAverageRating, getProductRating };
