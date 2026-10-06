import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { InfiniteList } from '../components/InfiniteList.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { mockPromotions } from '../mocks/mockPromotions.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { mockCategories } from '../mocks/mockCategories.js';
import { CHUNK_SIZE } from '../utils/constants.js';
import { getProductRating } from '../utils/productRating.js';
import { PRODUCT_SORT_OPTIONS, sortProducts } from '../utils/productSort.js';
import './PromotionDetailPage.css';

function PromotionDetailPage() {
  const { promotionId } = useParams();
  return <PromotionContent key={promotionId} promotionId={promotionId} />;
}

function PromotionContent({ promotionId }) {
  // 평점순 정렬과 카드 평점이 같은 리뷰 목록을 본다
  const { setListComplete, allProductReviews } = useOutletContext();
  const [sortType, setSortType] = useState('default');
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const promotion = mockPromotions.find((item) => item.id === promotionId);
  const products = sortProducts((promotion?.productIds ?? []).map((id) => mockProducts.find((product) => product.id === id)).filter(Boolean), sortType, allProductReviews);
  const isComplete = visibleCount >= products.length;

  useEffect(() => { setListComplete(isComplete); }, [isComplete, setListComplete]);
  useEffect(() => { return () => setListComplete(true); }, [setListComplete]);

  if (!promotion) return <div className="promotion-detail"><h1>기획전을 찾을 수 없습니다.</h1><Link to="/promotions">기획전 목록으로</Link></div>;

  return (
    <div className="promotion-detail">
      <Link to="/promotions">← 기획전 전체보기</Link>
      <header className="promotion-detail-header">
        <div className="promotion-detail-copy"><p className="eyebrow">PETTOPIA SELECTION</p><h1>{promotion.title}</h1><p>{promotion.description}</p></div>
        <img className="promotion-detail-image" src={promotion.imageUrl} alt={promotion.imageAlt} width="1448" height="1086" fetchPriority="high" decoding="async" />
      </header>
      <div className="promotion-detail-toolbar">
        <p>총 {products.length}개 상품</p>
        <label>정렬 <select value={sortType} onChange={(event) => { setSortType(event.target.value); setVisibleCount(CHUNK_SIZE); }}>{PRODUCT_SORT_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
      </div>
      {products.length === 0 ? <p>준비 중인 기획전입니다.</p> : <InfiniteList isComplete={isComplete} completeMessage="모든 상품을 확인하셨습니다." onLoadMore={() => setVisibleCount((count) => count + CHUNK_SIZE)}>
        {products.slice(0, visibleCount).map((product) => <ProductCard key={product.id} product={product} showDiscount categoryName={mockCategories.find((category) => category.id === product.categoryId)?.name} ratingSummary={getProductRating(allProductReviews, product.id)} />)}
      </InfiniteList>}

    </div>
  );
}

export { PromotionDetailPage };
