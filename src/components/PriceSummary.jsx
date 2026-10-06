import { formatWon } from '../utils/money.js';
import './PriceSummary.css';

// 계산하지 않는다. utils/money.js 가 계산한 값을 받아 표시만 한다.
// money.js 에서 가져오는 formatWon 도 계산이 아니라 표시 서식이다.
function PriceSummary({
  subtotal = 0,
  discountTotal = 0,
  shippingFee = 0,
  totalAmount = 0,
  showDiscount = false
}) {
  return (
    <dl className="price-summary">
      <div className="price-summary-row">
        <dt className="price-summary-term">상품 금액</dt>
        <dd className="price-summary-desc">{formatWon(subtotal)}</dd>
      </div>

      {/* 할인 표시를 구현하지 않으면 할인액 줄을 내보내지 않는다 */}
      {showDiscount ? (
        <div className="price-summary-row">
          <dt className="price-summary-term">할인액</dt>
          <dd className="price-summary-desc">-{formatWon(discountTotal)}</dd>
        </div>
      ) : null}

      <div className="price-summary-row">
        <dt className="price-summary-term">배송비</dt>
        <dd className="price-summary-desc">{formatWon(shippingFee)}</dd>
      </div>

      <div className="price-summary-row price-summary-row-total">
        <dt className="price-summary-term">최종 결제 금액</dt>
        <dd className="price-summary-desc">{formatWon(totalAmount)}</dd>
      </div>
    </dl>
  );
}

export { PriceSummary };
