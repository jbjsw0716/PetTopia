import { Link, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { LineItemList } from '../components/LineItemList.jsx';
import { PriceSummary } from '../components/PriceSummary.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatDateTime } from '../utils/datetime.js';
import './OrderCompletePage.css';

// S-05 주문 완료 — F-12 의 성공 결과를 보여준다.
//
// 이 화면은 저장된 주문을 읽어 보여줄 뿐 주문을 만들지 않는다.
// 다시 들어오거나 새로고침해도 주문이 또 생기지 않는다.
// 그래서 여기에는 변경 함수가 하나도 없다 — 읽는 것은 URL 의 :orderId 와 저장된 orders 뿐이다.
//
// 금액은 저장된 값 그대로이며 다시 계산하지 않는다.

function OrderCompletePage() {
  const { orderId } = useParams();
  const { orders, storageStatus } = useOutletContext();

  // 저장 데이터를 읽지 못한 경우는 주문이 없는 경우와 구분해 안내한다
  if (storageStatus === 'error') {
    return (
      <div className="order-complete">
        <h1>주문 완료</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 주문 결과를 표시할 수 없습니다."
          actionLabel="상품 목록으로"
          actionTo="/products"
        />
      </div>
    );
  }

  const order = orders.find((item) => item.id === orderId);

  // 해당 주문 없음 — 완료 문구를 표시하지 않는다.
  // 정의되지 않은 주소(페이지 없음)와 섞지 않는다. 주소는 맞지만 데이터가 없는 경우다
  if (!order) {
    return (
      <div className="order-complete">
        <h1>주문 완료</h1>
        <EmptyState
          message="요청한 주문을 찾을 수 없습니다."
          actionLabel="주문 내역 보기"
          actionTo="/orders"
        />
      </div>
    );
  }

  // 취소된 주문이면 현재 상태를 표시하고 주문 내역으로 연결한다.
  // 완료 문구를 그대로 두면 지금 상태와 어긋난다
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="order-complete">
      <h1 className="order-complete-title">
        {isCancelled ? '취소된 주문입니다' : '주문이 완료되었습니다'}
      </h1>

      <dl className="order-complete-meta">
        <div className="order-complete-meta-row">
          <dt className="order-complete-term">주문 번호</dt>
          <dd className="order-complete-desc">{order.id}</dd>
        </div>
        <div className="order-complete-meta-row">
          <dt className="order-complete-term">주문 일시</dt>
          <dd className="order-complete-desc">{formatDateTime(order.orderedAt)}</dd>
        </div>
        <div className="order-complete-meta-row">
          <dt className="order-complete-term">상태</dt>
          <dd className="order-complete-desc">
            {/* 색이 아니라 문구로도 구분한다 */}
            <StatusBadge status={order.status} type="order" />
          </dd>
        </div>
      </dl>

      <section className="order-complete-section">
        <h2 className="order-complete-section-title">
          주문 상품 {order.items.length}건
        </h2>
        {/* 저장 시점 값을 그대로 표시한다. 현재 상품 가격을 다시 읽지 않는다 */}
        <LineItemList
          items={order.items.map((item) => ({ ...item, id: item.productId }))}
          showDiscount={true}
        />
      </section>

      <div className="order-complete-columns">
        <section className="order-complete-section">
          <h2 className="order-complete-section-title">배송 정보</h2>
          <dl className="order-complete-shipping">
            <div className="order-complete-meta-row">
              <dt className="order-complete-term">수령인</dt>
              <dd className="order-complete-desc">
                {order.shipping.recipientName}
              </dd>
            </div>
            <div className="order-complete-meta-row">
              <dt className="order-complete-term">연락처</dt>
              <dd className="order-complete-desc">{order.shipping.phone}</dd>
            </div>
            <div className="order-complete-meta-row">
              <dt className="order-complete-term">주소</dt>
              <dd className="order-complete-desc">{order.shipping.address}</dd>
            </div>
          </dl>
        </section>

        <section className="order-complete-section">
          <h2 className="order-complete-section-title">결제 금액</h2>
          <PriceSummary
            subtotal={order.subtotal}
            discountTotal={order.discountTotal}
            shippingFee={order.shippingFee}
            totalAmount={order.totalAmount}
            showDiscount={true}
          />
        </section>
      </div>

      <div className="order-complete-actions">
        <Link className="order-complete-orders" to="/orders">
          주문 내역 보기
        </Link>
        {/* 장바구니·주문 내역의 '계속 쇼핑하기' 와 같이 이전 조건을 비우고 목록을 연다 */}
        <Link className="order-complete-continue" to="/products?reset=1">
          계속 쇼핑하기
        </Link>
      </div>
    </div>
  );
}

export { OrderCompletePage };
