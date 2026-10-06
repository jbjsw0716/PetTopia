import { Link, useOutletContext } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { LineItemList } from '../components/LineItemList.jsx';
import { PriceSummary } from '../components/PriceSummary.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatDateTime } from '../utils/datetime.js';
import './OrderListPage.css';

// S-06 주문 내역 — F-13 조회.
//
// 저장된 주문 시점 값을 그대로 보여주며 다시 계산하지 않는다.
// 현재 mockProducts 를 보지 않는 이유가 이것이다 — 가격이 바뀌거나 상품이 사라져도
// 주문 기록은 그대로다.
//
// 취소 버튼은 여기 두지 않는다 — 주문 취소는 주문 상세 화면에서만 한다.
// 상세로 가지 않아도 여기서 모든 주문 상품과 금액을 확인할 수 있어야 한다.

function OrderListPage() {
  const { orders, storageStatus } = useOutletContext();

  // 불러오기 실패는 주문 없음과 다른 문구로 안내한다
  if (storageStatus === 'error') {
    return (
      <div className="order-list">
        <h1>주문 내역</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 주문 내역을 표시할 수 없습니다."
          actionLabel="계속 쇼핑하기"
          actionTo="/products?reset=1"
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-list">
        <h1>주문 내역</h1>
        <EmptyState
          message="주문 내역이 없습니다."
          actionLabel="계속 쇼핑하기"
          actionTo="/products?reset=1"
        />
      </div>
    );
  }

  // 최신순으로 정렬한 복사본을 만든다.
  // 원본 배열을 직접 정렬하지 않는다 — 저장 데이터의 순서가 바뀐다.
  // 같은 시각의 주문은 번호가 큰 쪽을 앞에 둔다. 번호는 커지기만 하므로 이것이 최신이다.
  const sortedOrders = [...orders].sort((a, b) => {
    const gap = Date.parse(b.orderedAt) - Date.parse(a.orderedAt);
    if (gap !== 0) {
      return gap;
    }
    return b.id < a.id ? -1 : 1;
  });

  return (
    <div className="order-list">
      <h1>주문 내역</h1>

      <div className="order-list-cards">
        {sortedOrders.map((order) => (
          <article className="order-card" key={order.id}>
            <header className="order-card-head">
              <span className="order-card-id">{order.id}</span>
              <span className="order-card-date">
                {formatDateTime(order.orderedAt)}
              </span>
              {/* 취소된 주문도 목록에 남기고 상태를 표시한다. 숨기지 않는다 */}
              <StatusBadge status={order.status} type="order" />
            </header>

            <LineItemList
              items={order.items.map((item) => ({ ...item, id: item.productId }))}
              showDiscount={true}
            />

            <div className="order-card-summary">
              <PriceSummary
                subtotal={order.subtotal}
                discountTotal={order.discountTotal}
                shippingFee={order.shippingFee}
                totalAmount={order.totalAmount}
                showDiscount={true}
              />
            </div>

            <Link className="order-card-detail" to={`/orders/${order.id}`}>
              주문 상세 보기 →
            </Link>
          </article>
        ))}
      </div>

      <Link className="order-list-continue" to="/products?reset=1">
        계속 쇼핑하기
      </Link>
    </div>
  );
}

export { OrderListPage };
