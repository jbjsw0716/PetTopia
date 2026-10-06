import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ProductRating } from '../components/ProductRating.jsx';
import { ProductDetailTabs } from '../components/ProductDetailTabs.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { QuantityInput } from '../components/QuantityInput.jsx';
import { mockCategories } from '../mocks/mockCategories.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { MAX_QUANTITY, PET_TYPE_LABELS } from '../utils/constants.js';
import { formatWon, getDiscountedPrice, getLineTotal } from '../utils/money.js';
import { getProductRating } from '../utils/productRating.js';
import './ProductDetailPage.css';

// S-02 상품 상세 — F-04 상세 조회 · F-05 구매 수량 선택 · F-06 장바구니 담기 ·
// F-31 관심 등록·해제 · F-45 할인 표시.

const QUANTITY_ERROR = '수량은 1~99 의 정수로 입력해 주세요.';
const ADD_SUCCESS = '장바구니에 담았습니다.';

function ProductDetailPage() {
  const { productId } = useParams();
  const {
    addToCart,
    storageStatus,
    wishlistProductIds,
    toggleWishlist,
    allProductReviews
  } = useOutletContext();
  const [wishError, setWishError] = useState(null);
  // quantityInput 은 입력 중 문자열, validQuantity 는 검사를 통과한 수량이다
  const [quantityInput, setQuantityInput] = useState('1');
  const [validQuantity, setValidQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState(null);
  // 담기 결과 — { ok, message } 또는 null.
  const [addResult, setAddResult] = useState(null);

  const product = mockProducts.find((item) => item.id === productId);

  // 해당 id 의 상품이 없으면 수량·담기·관심 조작을 제공하지 않는다
  if (!product) {
    return (
      <div className="product-detail">
        <EmptyState
          message="요청한 상품을 찾을 수 없습니다."
          actionLabel="목록으로"
          actionTo="/products"
        />
      </div>
    );
  }

  const category = mockCategories.find((item) => item.id === product.categoryId);
  const petTypeText = product.petTypes
    .map((petType) => PET_TYPE_LABELS[petType])
    .join(' · ');
  const metaText = category ? petTypeText + ' · ' + category.name : petTypeText;

  // 할인 표시 — 할인율이 없거나 0 이면 취소선과 할인 표시를 내보내지 않는다
  const hasDiscount = product.discountPercent > 0;
  const selectedAmount = getLineTotal(
    product.price,
    product.discountPercent,
    validQuantity
  );

  const isWished = wishlistProductIds.includes(product.id);

  // 평점은 화면이 계산해 숫자로 넘긴다
  const ratingSummary = getProductRating(allProductReviews, product.id);

  // F-05 — 1~99 의 정수만 확정한다. 소수·빈 값·문자·범위 밖이면 기존 수량을 유지하고 이유를 표시한다
  function handleQuantityChange(nextValue) {
    setQuantityInput(nextValue);

    if (!/^[0-9]+$/.test(nextValue)) {
      setQuantityError(QUANTITY_ERROR);
      return;
    }

    const parsed = Number(nextValue);
    if (parsed < 1 || parsed > MAX_QUANTITY) {
      setQuantityError(QUANTITY_ERROR);
      return;
    }

    setValidQuantity(parsed);
    setQuantityError(null);
  }

  // F-06 장바구니 담기.
  // 변경 함수가 합산·99 초과 판정·저장을 하고 { ok, message } 를 돌려준다.
  // 이 화면은 결과를 받아 안내만 한다 — 성공해도 화면을 이동하지 않는다.
  //
  // '처리 중' 상태를 만들지 않는다. localStorage 저장은 기다리는 구간이 없어
  // 버튼을 비활성화할 틈이 없고, 두 번 눌러도 각각 한 번씩 순서대로 처리된다.
  // 없는 지연을 지어내지 않는다.
  function handleAddToCart() {
    setAddResult(addToCart(product.id, validQuantity));
  }

  // F-31 관심 등록·해제. 담기와 마찬가지로 성공해도 화면을 옮기지 않는다.
  // 아이콘 상태는 wishlistProductIds 에서 파생되므로, 저장에 실패해 확정 상태가
  // 바뀌지 않으면 버튼도 저절로 원래 상태로 남는다 — 따로 되돌리는 코드가 필요 없다.
  function handleWishToggle() {
    const result = toggleWishlist(product.id);
    setWishError(result.ok ? null : result.message);
  }

  return (
    <div className="product-detail">
      <Link className="product-detail-back" to="/products">
        목록으로
      </Link>

      <div className="product-detail-main">
        {product.imageUrl ? (
          <img
            className="product-detail-image"
            src={product.imageUrl}
            alt={product.name}
          />
        ) : (
          /* 사진 경로가 비어 있으면 자리만 둔다. 빈 문자열을 이미지 주소에 넣지 않는다 */
          <div className="product-detail-image product-detail-image-empty" />
        )}

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-detail-meta">{metaText}</p>

          {hasDiscount ? (
            <p className="product-detail-price">
              <span className="product-detail-price-origin">
                {formatWon(product.price)}
              </span>
              <span className="product-detail-price-sale">
                {formatWon(getDiscountedPrice(product.price, product.discountPercent))}
              </span>
              <span className="product-detail-discount">
                {product.discountPercent}%
              </span>
            </p>
          ) : (
            <p className="product-detail-price">
              <span className="product-detail-price-sale">
                {formatWon(product.price)}
              </span>
            </p>
          )}

          <ProductRating
            productId={product.id}
            average={ratingSummary.average}
            count={ratingSummary.count}
            detail
          />
          <div className="product-detail-quantity">
            <p className="product-detail-quantity-label">구매 수량</p>
            <QuantityInput
              value={quantityInput}
              max={MAX_QUANTITY}
              errorMessage={quantityError}
              onQuantityChange={handleQuantityChange}
            />
            <p className="product-detail-selected">
              선택 금액 {formatWon(selectedAmount)}
            </p>
          </div>

          {/* 저장 데이터를 읽지 못했으면 저장이 필요한 동작을 막는다.
              읽지 못한 데이터 위에 덮어쓰지 않기 위해서다 */}
          {wishError && <p className="product-detail-add-error" role="alert">{wishError}</p>}
          <div className="product-detail-actions">
            <button
              type="button"
              className="product-detail-add"
              disabled={storageStatus !== 'ready'}
              onClick={handleAddToCart}
            >
              장바구니 담기
            </button>

            <button
              type="button"
              className={
                isWished ? 'product-detail-wish is-wished' : 'product-detail-wish'
              }
              aria-pressed={isWished}
              disabled={storageStatus !== 'ready'}
              onClick={handleWishToggle}
            >
              {/* ♥/♡ 두 글자는 글꼴마다 잉크 크기가 달라 눌렀을 때 아이콘이 커지거나
                  작아져 보였다 (ProductCard 와 같은 문제). 같은 svg 하나를 두고 fill 만
                  바꿔 크기가 항상 같게 한다 (HeaderIcon 의 heart 와 같은 경로) */}
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
              {isWished ? '관심 해제' : '관심 등록'}
            </button>
          </div>

          {addResult ? (
            addResult.ok ? (
              <p className="product-detail-add-result" role="status">
                {ADD_SUCCESS}{' '}
                <Link className="product-detail-add-link" to="/cart">
                  장바구니 보기
                </Link>
              </p>
            ) : (
              <p
                className="product-detail-add-result product-detail-add-error"
                role="alert"
              >
                {addResult.message}
              </p>
            )
          ) : null}
        </div>
      </div>

      <ProductDetailTabs
        key={product.id}
        product={product}
        allProductReviews={allProductReviews}
      />
    </div>
  );
}

export { ProductDetailPage };
