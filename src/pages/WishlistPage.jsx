import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { mockCategories } from '../mocks/mockCategories.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { getProductRating } from '../utils/productRating.js';
import './WishlistPage.css';

// S-20 찜한 상품 — F-31 관심 목록 조회 · 해제, 상세 이동.
//
// 관심 목록은 현재 가격으로 표시한다 — 주문·예약과 달리 거래 기록이 아니라서
// 시점 값을 보존하지 않는다. 현재 가격은 지금 할인가다 — 상품 목록처럼
// 원가 취소선과 할인가를 함께 보인다. 마이페이지의 할인가와 같고,
// 장바구니에 담았을 때 실제로 계산되는 금액과도 같다.
//
// 저장된 id 로 기초 배열(mockProducts)에서 상품을 찾는다. mock 에 없는 id 는 건너뛰지 않고
// '상품 정보 없음' 카드와 찜 해제 버튼을 보인다.
// 목록 전체를 실패로 만들지 않고, 건수도 마이페이지와 같게 저장된 id 수 그대로다.

function getCategoryName(categoryId) {
  const category = mockCategories.find((item) => item.id === categoryId);
  return category ? category.name : '';
}

function WishlistPage() {
  const { wishlistProductIds, toggleWishlist, storageStatus, allProductReviews } =
    useOutletContext();
  // 해제 저장에 실패했을 때만 쓴다. 성공하면 목록이 저절로 줄어드므로 따로 지운다
  const [saveError, setSaveError] = useState(null);

  // 불러오기 실패는 찜한 상품 없음과 다른 문구로 안내한다
  if (storageStatus === 'error') {
    return (
      <div className="wishlist">
        <h1>찜한 상품</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 찜한 상품을 표시할 수 없습니다."
          actionLabel="계속 쇼핑하기"
          actionTo="/products?reset=1"
        />
      </div>
    );
  }

  // wishlistProductIds 의 등록 순서를 그대로 따른다.
  // 정렬을 다시 하지 않는다 — 이 화면이 새로 정하는 규칙이 아니다.
  const wishedItems = wishlistProductIds.map((productId) => ({
    productId,
    product: mockProducts.find((item) => item.id === productId)
  }));

  // F-31 해제. 성공하면 wishlistProductIds 가 줄어 이 화면이 다시 그려지고 카드가 사라진다.
  // 실패하면 목록은 그대로 남고 이유만 알린다.
  function handleUnwish(productId) {
    const result = toggleWishlist(productId);
    setSaveError(result.ok ? null : result.message);
  }

  if (wishedItems.length === 0) {
    return (
      <div className="wishlist">
        <h1>찜한 상품</h1>
        <EmptyState
          message="찜한 상품이 없습니다."
          actionLabel="상품 보러 가기"
          actionTo="/products?reset=1"
        />
      </div>
    );
  }

  return (
    <div className="wishlist">
      <h1>찜한 상품</h1>
      <p className="wishlist-count">찜한 상품 {wishedItems.length}건</p>

      <div className="wishlist-cards">
        {wishedItems.map(({ productId, product }) =>
          product ? (
            <ProductCard
              key={productId}
              product={product}
              categoryName={getCategoryName(product.categoryId)}
              isWished={true}
              showWish={true}
              showDiscount={true}
              ratingSummary={getProductRating(allProductReviews, product.id)}
              onWishToggle={handleUnwish}
            />
          ) : (
            <article className="wishlist-missing" key={productId}>
              <div className="wishlist-missing-image" aria-hidden="true" />
              <h3 className="wishlist-missing-name">상품 정보 없음</h3>
              <p className="wishlist-missing-text">
                지금은 찾을 수 없는 상품입니다. 찜을 해제해 목록에서 뺄 수 있습니다.
              </p>
              <button
                type="button"
                className="wishlist-missing-unwish"
                onClick={() => handleUnwish(productId)}
              >
                찜 해제
              </button>
            </article>
          )
        )}
      </div>

      {saveError ? (
        <p className="wishlist-save-error" role="alert">
          {saveError}
        </p>
      ) : null}
    </div>
  );
}

export { WishlistPage };
