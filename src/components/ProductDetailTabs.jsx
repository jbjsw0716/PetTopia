import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductQuestions } from './ProductQuestions.jsx';
import { getProductRating } from '../utils/productRating.js';
import { formatDateTime } from '../utils/datetime.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { ProductCard } from './ProductCard.jsx';
import './ProductDetailTabs.css';
// 리뷰 목록은 상품 상세가 Outlet context 에서 받아 props 로 넘긴다
// 리뷰 날짜는 펫시터 후기와 같은 2026-09-12 모양이다. '체험용 후기' 딱지는 달지 않는다
function ProductDetailTabs({ product, allProductReviews = [] }) {
  const [tab, setTab] = useState('정보');
  const reviews = allProductReviews.filter((review) => review.productId === product.id).sort((a,b) => Date.parse(b.writtenAt) - Date.parse(a.writtenAt));
  const recommended = mockProducts.filter((item) => item.id !== product.id && item.categoryId === product.categoryId && item.petTypes.some((pet) => product.petTypes.includes(pet))).sort((a,b) => b.discountPercent - a.discountPercent).slice(0,4);
  return <section className="product-detail-tabs"><div role="tablist" aria-label="상품 상세 내용">{['정보','추천','리뷰','문의'].map((name) => <button type="button" key={name} id={`product-tab-${name}`} role="tab" aria-selected={tab === name} aria-controls="product-tab-panel" onClick={() => setTab(name)}>{name}{name === '리뷰' ? ` (${reviews.length})` : ''}</button>)}</div>
    <div id="product-tab-panel" role="tabpanel" aria-labelledby={`product-tab-${tab}`}>
      {tab === '정보' && <><h2>상품 정보</h2><p>{product.description}</p></>}
      {tab === '추천' && <><h2>함께 둘러보세요</h2><div className="product-related">{recommended.map((item) => <ProductCard key={item.id} product={item} showDiscount ratingSummary={getProductRating(allProductReviews, item.id)} />)}</div></>}
      {tab === '리뷰' && <><h2>상품 리뷰</h2><Link to={`/products/${product.id}/reviews`}>전체 리뷰 보기 · 리뷰 작성 →</Link>{reviews.length === 0 ? <p>아직 등록된 리뷰가 없습니다.</p> : reviews.map((review) => <article className="product-tab-review" key={review.id}><p><span className="product-tab-review-star">★</span> {review.rating.toFixed(1)} · {review.author}</p><p>{review.content}</p><small>{formatDateTime(review.writtenAt).slice(0, 10)}</small></article>)}</>}
      {tab === '문의' && <ProductQuestions product={product} />}
    </div></section>;
}

export { ProductDetailTabs };
