import { Link } from 'react-router-dom';
import './ProductRating.css';

// 계산하지 않는다. 화면이 utils/productRating.js 로 계산한
// 평균(average, 0건이면 null)과 리뷰 수(count)를 받아 그린다. detail 이면 리뷰 수가 리뷰 화면 링크가 된다.
function ProductRating({ productId, average = null, count = 0, detail = false }) {
  return (
    <div className="product-rating">
      <span className="product-rating-star" aria-hidden="true">★</span>
      <span>{average === null ? '평점 없음' : average.toFixed(1)}</span>
      {detail ? (
        <Link to={`/products/${productId}/reviews`}>리뷰 {count}개</Link>
      ) : (
        <span>({count})</span>
      )}
    </div>
  );
}

export { ProductRating };
