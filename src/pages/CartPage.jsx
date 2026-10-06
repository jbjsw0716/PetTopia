import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { ConfirmArea } from '../components/ConfirmArea.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { PriceSummary } from '../components/PriceSummary.jsx';
import { QuantityInput } from '../components/QuantityInput.jsx';
import { mockProducts } from '../mocks/mockProducts.js';
import { MAX_QUANTITY } from '../utils/constants.js';
import {
  formatWon,
  getCartAmounts,
  getDiscountedPrice,
  getLineTotal
} from '../utils/money.js';
import './CartPage.css';

// S-03 장바구니 — F-07 조회 · F-08 수량 변경 · F-09 삭제 · F-32 선택·선택 삭제 · F-33 선택 주문 ·
// F-37 예상 배송비 · F-45 할인 표시.
//
// 선택은 저장하지 않는다. 새로고침하면 모두 풀린 채 시작한다.
//
// 구매할 수 없는 상품이 하나라도 있으면 주문하지 않는다. 그 줄을 지우면 된다.
//
// 금액은 utils/money.js 가 계산한다. 이 화면은 productId 로 상품을 찾아 넘기기만 한다
// (장바구니에 금액을 저장하지 않는다).

const QUANTITY_ERROR = '수량은 1~99 의 정수로 입력해 주세요.';
// 선택 0건 · 구매 불가 상품이 있을 때 버튼을 막고 그 이유를 버튼 가까이에 적는다
const NO_DELETE_SELECTION_TEXT = '삭제할 상품을 선택해 주세요.';
const NO_ORDER_SELECTION_TEXT = '주문할 상품을 선택해 주세요.';
const UNAVAILABLE_ORDER_TEXT = '구매할 수 없는 상품을 삭제한 뒤 주문해 주세요.';
// 고른 상품이 없을 때의 금액 요약 — 보낼 상품이 없으니 배송비도 0원이다.
// money.js 의 getCartAmounts 는 0건에 배송비 3,000원을 돌려준다(규칙 그대로). 그 값은 주문할
// 상품이 있을 때의 것이라 0건은 부르지 않고 이 값을 보인다. 계산이 아니라 '금액 없음' 표시다.
const EMPTY_AMOUNTS = { subtotal: 0, discountTotal: 0, shippingFee: 0, totalAmount: 0 };

function CartPage() {
  const {
    cartItems,
    storageStatus,
    updateCartQuantity,
    removeCartItem,
    removeSelectedCartItems,
    prepareCheckout
  } = useOutletContext();
  const navigate = useNavigate();

  // 장바구니에서 빠진 번호가 남아 있어도 아래에서 지금 있는 줄과 맞춰 본 것만 쓴다.
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // 행마다 입력 중 문자열과 오류 문구를 productId 로 구분해 담는다.
  // 확정 수량과 동기화하는 useEffect 를 두지 않는다. 키가 없으면 확정 수량을 그대로
  // 보여주고, 저장이 끝나면 키를 지워 확정 수량으로 돌아가게 한다 (oxlint set-state-in-effect).
  const [quantityInputs, setQuantityInputs] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  // 주문 시작 실패 안내. 저장 실패와 자리가 달라 따로 둔다 — 이쪽은 요약 영역에 붙는다
  const [orderError, setOrderError] = useState(null);

  // 저장 데이터를 읽지 못한 경우는 데이터가 없는 경우와 구분해 안내한다.
  // 헤더 아래 안내는 Layout 이 갖고, 여기서는 본문이 빈 장바구니로 보이지 않게 막는다.
  if (storageStatus === 'error') {
    return (
      <div className="cart">
        <h1>장바구니</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 장바구니를 표시할 수 없습니다."
          actionLabel="계속 쇼핑하기"
          actionTo="/products?reset=1"
        />
      </div>
    );
  }

  // 상품을 찾지 못한 항목은 구매 불가다. 0원 상품처럼 다루지 않고 금액 계산에서 빼되
  // 삭제는 허용한다.
  const rows = cartItems.map((item) => ({
    item,
    product: mockProducts.find((product) => product.id === item.productId)
  }));
  const validRows = rows.filter((row) => row.product);
  const invalidCount = rows.length - validRows.length;

  // 구매할 수 없는 줄도 골라서 지울 수 있다
  const selectedRows = rows.filter((row) => selectedIds.includes(row.item.productId));
  const selectedProductIds = selectedRows.map((row) => row.item.productId);
  const isAllSelected = rows.length > 0 && selectedRows.length === rows.length;

  // 금액은 고른 상품으로만 낸다. 배송비 판정도 고른 상품의 할인 후 금액이다
  const selectedValidRows = selectedRows.filter((row) => row.product);
  const amounts =
    selectedValidRows.length === 0
      ? EMPTY_AMOUNTS
      : getCartAmounts(
          selectedValidRows.map((row) => ({
            unitPrice: row.product.price,
            discountPercent: row.product.discountPercent,
            quantity: row.item.quantity
          }))
        );

  // 주문 버튼을 막는 이유. 구매 불가 상품이 먼저다 — 고르기만 해서는 풀리지 않기 때문이다
  let orderBlockReason = null;
  if (invalidCount > 0) {
    orderBlockReason = UNAVAILABLE_ORDER_TEXT;
  } else if (selectedRows.length === 0) {
    orderBlockReason = NO_ORDER_SELECTION_TEXT;
  }

  // 입력 중 문자열과 오류 문구를 함께 지워 확정 수량으로 돌아가게 한다.
  // 저장에 실패한 경우에도 부른다 — 확정 수량이 바뀌지 않았으므로 저장 전 값이 그대로 보인다.
  // 선택 삭제가 여러 줄을 한 번에 넘긴다.
  function clearQuantityState(productIds) {
    const nextInputs = { ...quantityInputs };
    const nextErrors = { ...quantityErrors };

    for (const productId of productIds) {
      delete nextInputs[productId];
      delete nextErrors[productId];
    }

    setQuantityInputs(nextInputs);
    setQuantityErrors(nextErrors);
  }

  // F-32 전체 선택
  function handleSelectAll(event) {
    setSelectedIds(event.target.checked ? rows.map((row) => row.item.productId) : []);
  }

  // F-32 한 줄 선택. 같은 번호가 두 번 들어가지 않게 먼저 빼고 넣는다
  function handleSelect(productId, isChecked) {
    const others = selectedIds.filter((id) => id !== productId);
    setSelectedIds(isChecked ? [...others, productId] : others);
  }

  // F-32 선택 삭제 — 바로 지우지 않고 확인 영역을 연다
  function handleDeleteStart() {
    setSaveError(null);
    setDeleteConfirmOpen(true);
  }

  // 돌아가기 — 확인 영역만 닫는다. 선택은 그대로 둔다
  function handleDeleteCancel() {
    setDeleteConfirmOpen(false);
  }

  // 저장에 실패하면 목록과 선택을 그대로 두고 이유를 알린다
  function handleDeleteConfirm() {
    const result = removeSelectedCartItems(selectedProductIds);
    setDeleteConfirmOpen(false);

    if (!result.ok) {
      setSaveError(result.message);
      return;
    }

    clearQuantityState(selectedProductIds);
    setSelectedIds([]);
    setSaveError(null);
    setOrderError(null);
  }

  // F-08 — 1~99 의 정수만 확정한다. 범위 밖이면 기존 수량을 유지하고 그 행에 이유를 표시한다
  function handleQuantityChange(productId, nextValue) {
    const parsed = Number(nextValue);
    const isValid =
      /^[0-9]+$/.test(nextValue) && parsed >= 1 && parsed <= MAX_QUANTITY;

    if (!isValid) {
      setQuantityInputs({ ...quantityInputs, [productId]: nextValue });
      setQuantityErrors({ ...quantityErrors, [productId]: QUANTITY_ERROR });
      return;
    }

    const result = updateCartQuantity(productId, parsed);
    clearQuantityState([productId]);
    setSaveError(result.ok ? null : result.message);
  }

  // F-09 — 확인을 받지 않는다. 저장에 실패하면 항목을 지우지 않고 재시도를 안내한다
  function handleRemove(productId) {
    const result = removeCartItem(productId);
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    clearQuantityState([productId]);
    setSelectedIds(selectedIds.filter((id) => id !== productId));
    setSaveError(null);
    setOrderError(null);
  }

  // F-10 주문 시작 · F-33 선택 주문. 고른 상품만 넘겨 초안을 만들고, 성공했을 때만 주문서로 이동한다.
  // 구매 불가 상품이 섞였는지·고른 것이 있는지는 prepareCheckout 이 다시 본다.
  // 주문 대상이 0건이면 주문서로 이동하지 않고 여기에 이유를 표시한다.
  function handleOrder() {
    const result = prepareCheckout(selectedProductIds);

    if (!result.ok) {
      setOrderError(result.message);
      return;
    }

    setOrderError(null);
    navigate('/checkout');
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <h1>장바구니</h1>
        <EmptyState
          message="장바구니가 비어 있습니다."
          actionLabel="계속 쇼핑하기"
          actionTo="/products?reset=1"
        />
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>장바구니</h1>

      <div className="cart-select-bar">
        <label className="cart-select-all">
          <input
            type="checkbox"
            className="cart-select-check"
            checked={isAllSelected}
            onChange={handleSelectAll}
          />
          전체 선택 ({selectedRows.length}/{rows.length})
        </label>
        <button
          type="button"
          className="cart-select-delete"
          disabled={selectedRows.length === 0 || isDeleteConfirmOpen}
          onClick={handleDeleteStart}
        >
          선택 삭제
        </button>
        {selectedRows.length === 0 ? (
          <p className="cart-select-note">{NO_DELETE_SELECTION_TEXT}</p>
        ) : null}
      </div>

      {isDeleteConfirmOpen ? (
        <div className="cart-select-confirm">
          <ConfirmArea
            isOpen={isDeleteConfirmOpen}
            message={`선택한 상품 ${selectedRows.length}건을 장바구니에서 삭제할까요?`}
            confirmLabel="삭제"
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        </div>
      ) : null}

      <div className="cart-body">
        <div className="cart-items">
          {rows.map(({ item, product }) => {
            const inputValue = quantityInputs[item.productId];
            const hasDiscount = product && product.discountPercent > 0;

            return (
              <div className="cart-row" key={item.productId}>
                <input
                  type="checkbox"
                  className="cart-select-check"
                  aria-label={(product ? product.name : item.productId) + ' 선택'}
                  checked={selectedIds.includes(item.productId)}
                  onChange={(event) => handleSelect(item.productId, event.target.checked)}
                />

                {product && product.imageUrl ? (
                  <img
                    className="cart-row-image"
                    src={product.imageUrl}
                    alt={product.name}
                  />
                ) : (
                  <div className="cart-row-image cart-row-image-empty" />
                )}

                <div className="cart-row-info">
                  {product ? (
                    <>
                      <Link
                        className="cart-row-name"
                        to={'/products/' + item.productId}
                      >
                        {product.name}
                      </Link>
                      <p className="cart-row-price">
                        단가{' '}
                        {hasDiscount ? (
                          <>
                            <span className="cart-row-price-origin">
                              {formatWon(product.price)}
                            </span>
                            <span className="cart-row-price-sale">
                              {formatWon(
                                getDiscountedPrice(
                                  product.price,
                                  product.discountPercent
                                )
                              )}
                            </span>
                            <span className="cart-row-discount">
                              {product.discountPercent}%
                            </span>
                          </>
                        ) : (
                          <span className="cart-row-price-sale">
                            {formatWon(product.price)}
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="cart-row-name">{item.productId}</p>
                      <p className="cart-row-invalid">
                        지금은 구매할 수 없는 상품입니다. 확인 후 삭제해 주세요.
                      </p>
                    </>
                  )}
                </div>

                {product ? (
                  <div className="cart-row-quantity">
                    <QuantityInput
                      value={
                        inputValue === undefined
                          ? String(item.quantity)
                          : inputValue
                      }
                      max={MAX_QUANTITY}
                      errorMessage={quantityErrors[item.productId]}
                      onQuantityChange={(nextValue) =>
                        handleQuantityChange(item.productId, nextValue)
                      }
                    />
                  </div>
                ) : (
                  <div className="cart-row-quantity">
                    <p className="cart-row-quantity-fixed">{item.quantity}개</p>
                  </div>
                )}

                <p className="cart-row-total">
                  {product
                    ? formatWon(
                        getLineTotal(
                          product.price,
                          product.discountPercent,
                          item.quantity
                        )
                      )
                    : '-'}
                </p>

                <button
                  type="button"
                  className="cart-row-remove"
                  onClick={() => handleRemove(item.productId)}
                >
                  삭제
                </button>
              </div>
            );
          })}

          {/* 지우기 전에는 주문할 수 없다는 안내는 주문 버튼 아래에 있다 */}
          {invalidCount > 0 ? (
            <p className="cart-invalid-notice">
              구매할 수 없는 상품 {invalidCount}건을 금액 계산에서 제외했습니다.
            </p>
          ) : null}

          {/* 저장 실패 안내 — 실행한 목록 가까이에 둔다 */}
          {saveError ? (
            <p className="cart-save-error" role="alert">
              {saveError}
            </p>
          ) : null}
        </div>

        <aside className="cart-summary">
          <h2 className="cart-summary-title">결제 예정 금액</h2>
          <p className="cart-summary-selection">
            선택한 상품 {selectedRows.length}건 · 장바구니 전체 {rows.length}건
          </p>

          <PriceSummary
            subtotal={amounts.subtotal}
            discountTotal={amounts.discountTotal}
            shippingFee={amounts.shippingFee}
            totalAmount={amounts.totalAmount}
            showDiscount={true}
          />

          {/* 배송비는 주문 대상이 확정되는 곳이 주문서라 '예상' 임을 함께 적는다 */}
          <p className="cart-summary-note">
            배송비는 예상 금액이며 주문서에서 확정됩니다.
          </p>

          <button
            type="button"
            className="cart-summary-order"
            disabled={orderBlockReason !== null}
            onClick={handleOrder}
          >
            선택한 상품 주문하기
          </button>

          {orderBlockReason ? (
            <p className="cart-summary-reason">{orderBlockReason}</p>
          ) : null}

          {orderError ? (
            <p className="cart-summary-error" role="alert">
              {orderError}
            </p>
          ) : null}
        </aside>
      </div>

      <Link className="cart-continue" to="/products?reset=1">
        계속 쇼핑하기
      </Link>
    </div>
  );
}

export { CartPage };
