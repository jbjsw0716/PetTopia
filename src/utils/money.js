// 금액 계산. 같은 계산식이 두 곳에 생기지 않게 여기에만 둔다.

import { FREE_SHIPPING_MIN, SHIPPING_FEE } from './constants.js';

// 항목별 할인액 — 항목별로 버린 뒤 더한다. 합계를 먼저 내고 버리지 않는다.
// 단가마다 버린 뒤 수량을 곱하면 floor(1,498.5) × 2 = 2,996 이 되어, 항목 한 번에 버린
// 9,990 × 15 × 2 / 100 = 2,997 과 갈라진다.
function getDiscountAmount(unitPrice, discountPercent, quantity) {
  return Math.floor((unitPrice * discountPercent * quantity) / 100);
}

function getDiscountedPrice(price, discountPercent) {
  return price - getDiscountAmount(price, discountPercent, 1);
}

function getLineTotal(unitPrice, discountPercent, quantity) {
  return unitPrice * quantity - getDiscountAmount(unitPrice, discountPercent, quantity);
}

// F-37 배송비.
// 기준은 할인 전 상품 금액이 아니라 할인 후 상품금액이다. 할인 때문에 배송비가
// 생기는 경계가 있다 — P001 2개는 할인 없이 32,000원(무료)이지만 10% 할인하면
// 28,800원이라 3,000원이 붙는다.
// 30,000원 정확히면 무료다 (`이상`).
function getShippingFee(discountedSubtotal) {
  return discountedSubtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

// 장바구니·주문 대상의 금액 묶음.
//
// lines 한 건은 { unitPrice, discountPercent, quantity } 다. 장바구니 항목에는 금액이
// 없으므로 부르는 쪽이 productId 로 상품을 찾아 이 모양으로 만들어 넘긴다.
// 돌려주는 네 값이 PriceSummary 의 props 와 그대로 맞는다.
//
// 구매 불가 항목(mock 에 없는 productId)은 부르는 쪽이 미리 걸러 넘긴다 —
// 0원 상품처럼 다루지 않는다.
// lines 가 0건이면 상품 금액이 0원이라 배송비 3,000원이 나온다. 규칙 그대로다.
// 빈 장바구니는 금액 요약 자체를 내보내지 않으므로 화면에 닿지 않는다.
function getCartAmounts(lines) {
  let subtotal = 0;
  let discountTotal = 0;

  for (const line of lines) {
    subtotal += line.unitPrice * line.quantity;
    discountTotal += getDiscountAmount(
      line.unitPrice,
      line.discountPercent,
      line.quantity
    );
  }

  const shippingFee = getShippingFee(subtotal - discountTotal);

  return {
    subtotal,
    discountTotal,
    shippingFee,
    totalAmount: subtotal - discountTotal + shippingFee
  };
}

// 예약 금액 — 요금 × 수량 하나로 끝난다.
// 수량의 단위(시간·회·일·박)가 서비스마다 달라도 식은 같다. 배송비도 할인도 없다.
function getReservationAmount(unitPrice, quantity) {
  return unitPrice * quantity;
}

// 펫시터 카드의 대표 요금 — 제공 서비스 중 가장 낮은 요금이다.
// 서비스가 없으면 0 이다. mockCheck 가 서비스 없는 펫시터를 걸러 화면에는 닿지 않는다.
function getLowestServicePrice(services) {
  let lowest = null;

  for (const service of services) {
    if (lowest === null || service.price < lowest) {
      lowest = service.price;
    }
  }

  return lowest === null ? 0 : lowest;
}

// 표시 서식. 계산이 아니라 그리는 방식이지만, 컴포넌트가 같은 모양을 써야 해서 여기 둔다.
function formatWon(amount) {
  return amount.toLocaleString('ko-KR') + '원';
}

export {
  getDiscountAmount,
  getDiscountedPrice,
  getLineTotal,
  getCartAmounts,
  getReservationAmount,
  getLowestServicePrice,
  formatWon
};
