import { Link } from 'react-router-dom';
import { ProductRating } from './ProductRating.jsx';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatWon, getDiscountedPrice } from '../utils/money.js';
import './ProductCard.css';

// 가격·할인 표시는 utils/money.js 의 함수로 계산한 값을 그린다. 카드가 계산식을 갖지 않는다.
// 평점도 같다 — 화면이 utils/productRating.js 로 계산한 { count, average } 를 ratingSummary 로
// 넘긴다. 카드가 리뷰 목록을 스스로 찾아 계산하지 않는다. 넘기지 않으면 평점 줄이 없다.
//
// 분류명(사료·간식 …)은 화면이 찾아서 넘긴다 — SitterCard 의 regionName 과 같은 방식이다.
// 카드가 mocks/mockCategories 를 직접 가져오면 목록 화면이 이미 가진 데이터를 두 번 읽는다.
// categoryName 이 비어 있으면 적용 동물만 표시한다.
//
// wishErrorMessage 는 이 카드의 하트 저장이 실패했을 때 화면이 넘긴다. 안내는 누른 카드에 붙어야
// 한다 — 목록 머리에 두면 스크롤로 내려간 자리에서는 보이지 않는다.
function ProductCard({
  product,
  categoryName = '',
  showImage = true,
  isWished = false,
  showWish = false,
  wishDisabled = false,
  showDiscount = false,
  ratingSummary = null,
  wishErrorMessage = '',
  onWishToggle = () => {}
}) {
  const hasDiscount = showDiscount && product.discountPercent > 0;

  const petTypeText = product.petTypes
    .map((petType) => PET_TYPE_LABELS[petType])
    .join(' · ');
  const metaText = categoryName ? petTypeText + ' · ' + categoryName : petTypeText;

  return (
    <article className="product-card">
      <Link className="product-card-body" to={'/products/' + product.id}>
        {showImage && (product.imageUrl ? (
          <img
            className="product-card-image"
            src={product.imageUrl}
            alt={product.name}
          />
        ) : (
          <div className="product-card-image product-card-image-empty" />
        ))}

        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-meta">{metaText}</p>
        {ratingSummary ? (
          <ProductRating
            productId={product.id}
            average={ratingSummary.average}
            count={ratingSummary.count}
          />
        ) : null}

        {hasDiscount ? (
          <p className="product-card-price">
            <span className="product-card-price-origin">
              {formatWon(product.price)}
            </span>
            <span className="product-card-price-sale">
              {formatWon(getDiscountedPrice(product.price, product.discountPercent))}
            </span>
            <span className="product-card-discount">{product.discountPercent}%</span>
          </p>
        ) : (
          <p className="product-card-price">
            <span className="product-card-price-sale">
              {formatWon(product.price)}
            </span>
          </p>
        )}
      </Link>

      {/* 관심 상품 관리를 구현하지 않으면 관심 아이콘을 내보내지 않는다.
          등록·해제 두 상태를 서로 다른 글자(♥ / ♡)로 나타내면 글꼴마다 잉크 크기가 달라
          눌렀을 때 아이콘이 커지거나 작아져 보인다. 같은 SVG 하나를 두고 fill 만
          바꿔 크기가 항상 같게 한다 (HeaderIcon 의 heart 와 같은 경로) */}
      {showWish ? (
        <button
          type="button"
          className={isWished ? 'product-card-wish is-wished' : 'product-card-wish'}
          aria-label={isWished ? '관심 해제' : '관심 등록'}
          aria-pressed={isWished}
          disabled={wishDisabled}
          onClick={() => onWishToggle(product.id)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isWished ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.5 5.8a5 5 0 0 0-7.1 0L12 7.2l-1.4-1.4a5 5 0 0 0-7.1 7.1L12 21l8.5-8.1a5 5 0 0 0 0-7.1Z" />
          </svg>
        </button>
      ) : null}

      {wishErrorMessage ? (
        <p className="product-card-wish-error" role="alert">
          {wishErrorMessage}
        </p>
      ) : null}
    </article>
  );
}

export { ProductCard };
