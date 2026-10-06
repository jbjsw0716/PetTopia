import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { mockProducts } from '../mocks/mockProducts.js';
import { formatDateTime } from '../utils/datetime.js';
import { getAverageRating } from '../utils/productRating.js';
import './ProductReviewsPage.css';

function ProductReviewsPage() {
  const { productId } = useParams();
  // 리뷰 목록은 Layout 이 처음부터 있는 리뷰와 저장된 리뷰를 합쳐 내려 준다.
  // 동물 선택은 주소(?pet=)가 아니라 Layout 의 공유 상태다 — 헤더 'Reviews' 가 정하고 여기서 바꾼다
  const { allProductReviews, addProductReview, storageStatus, reviewPetType, setReviewPetType } = useOutletContext();
  const [rating, setRating] = useState('5');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [sort, setSort] = useState('latest');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [resultLimit, setResultLimit] = useState(8);
  const product = mockProducts.find((item) => item.id === productId);
  const pet = reviewPetType;
  const matchingProducts = mockProducts.filter((item) => (pet === 'all' || item.petTypes.includes(pet)) && item.name.toLowerCase().includes(search.toLowerCase()));
  const reviews = allProductReviews.filter((review) => productId ? review.productId === productId : matchingProducts.some((item) => item.id === review.productId)).sort((a, b) => sort === 'rating' ? b.rating - a.rating || Date.parse(b.writtenAt) - Date.parse(a.writtenAt) : Date.parse(b.writtenAt) - Date.parse(a.writtenAt));
  // 평균은 utils/productRating.js 한 곳에서 낸다 — 상품 카드·상세와 같은 반올림이다
  const ratingSummary = getAverageRating(reviews);
  if (productId && !product) return <div><h1>상품을 찾을 수 없습니다.</h1><Link to="/products">상품 목록으로</Link></div>;
  function handleSubmit(event) {
    event.preventDefault();
    const result = addProductReview({ productId, rating: Number(rating), content });
    setMessage(result.ok ? '리뷰를 등록했습니다.' : result.message);
    if (result.ok) setContent('');
  }
  return <div className="product-reviews"><p className="eyebrow">PETTOPIA REVIEWS</p><h1>{product ? product.name + ' 리뷰' : '상품 리뷰'}</h1>
    {product && <Link to={`/products/${product.id}`}>← 상품 상세 보기</Link>}
    {!product && <section className="review-search"><form onSubmit={(event) => { event.preventDefault(); setSearch(query.trim()); setResultLimit(8); }}><label htmlFor="review-product-search">상품명 검색</label><div><input id="review-product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 사료, 낚싯대, 하네스" /><button type="submit">검색</button><button type="button" onClick={() => { setQuery(''); setSearch(''); setResultLimit(8); }}>초기화</button></div></form>
      {search && <div className="review-search-results"><p role="status">“{search}” 상품 {matchingProducts.length}개</p>{matchingProducts.slice(0, resultLimit).map((item) => <Link key={item.id} to={`/products/${item.id}/reviews`}>{item.name}<span>리뷰 {allProductReviews.filter((review) => review.productId === item.id).length}개 →</span></Link>)}{matchingProducts.length > resultLimit && <button type="button" onClick={() => setResultLimit(resultLimit + 8)}>검색 상품 더 보기</button>}</div>}
    </section>}
    <div className="product-review-toolbar"><strong>{reviews.length}개의 리뷰{ratingSummary.average !== null && ` · 평균 ${ratingSummary.average.toFixed(1)} / 5`}</strong>
    {!product && <label>반려동물 <select value={pet} onChange={(event) => setReviewPetType(event.target.value)}><option value="all">전체</option><option value="DOG">강아지</option><option value="CAT">고양이</option></select></label>}
    <label>정렬 <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="latest">최신순</option><option value="rating">평점 높은순</option></select></label></div>
    {storageStatus === 'error' ? <p role="alert">저장된 리뷰를 불러오지 못했습니다.</p> : reviews.length === 0 ? <p className="product-review-empty">{search && !product ? '검색한 상품의 리뷰가 없습니다. 다른 상품명을 검색해 보세요.' : '아직 등록된 리뷰가 없습니다. 상품을 사용한 경험을 나눠주세요.'}</p> : reviews.map((review) => <article className="product-review-item" key={review.id}><Link to={`/products/${review.productId}/reviews`}>{mockProducts.find((item) => item.id === review.productId)?.name || '상품'}</Link><p aria-label={`별점 ${review.rating}점`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p><p>{review.content}</p><small>{review.author} · {formatDateTime(review.writtenAt).slice(0, 10)}</small></article>)}
    {product ? <form className="product-review-form" onSubmit={handleSubmit}><h2>리뷰 작성</h2><p>작성한 리뷰는 이 브라우저에 저장됩니다.</p><label>별점 <select value={rating} onChange={(event) => setRating(event.target.value)}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value}점</option>)}</select></label><label htmlFor="product-review-content">상품 사용 후기</label><textarea id="product-review-content" minLength={10} maxLength={1000} required value={content} onChange={(event) => setContent(event.target.value)} placeholder="사용 경험을 10자 이상 작성해주세요." /><button type="submit" disabled={storageStatus !== 'ready'}>리뷰 등록</button><p role="status">{message}</p></form> : null}
  </div>;
}

export { ProductReviewsPage };
