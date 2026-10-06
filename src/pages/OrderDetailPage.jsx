import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ConfirmArea } from '../components/ConfirmArea.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LineItemList } from '../components/LineItemList.jsx';
import { PriceSummary } from '../components/PriceSummary.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatDateTime } from '../utils/datetime.js';
import './OrderDetailPage.css';

// S-21 주문 상세 — F-39 조회 · F-40 주문 취소.
//
// 저장된 주문 시점 값을 그대로 보여주며 다시 계산하지 않는다.
// 현재 mockProducts 를 보지 않는다 — 주문 완료 · 주문 내역과 같은 원칙이다.
//
// 주문은 상태가 COMPLETED 이면 언제든 취소할 수 있다. 예약과 달리 날짜 조건이 없어
// 취소할 수 없는 이유를 안내하는 문구도 없다.
// 실제 조건은 Layout 의 cancelOrder 가 저장 직전에 다시 본다 — 여기는
// 버튼을 보여줄지만 정한다. 취소해도 주문 상세에 머문다. 별도 취소 페이지를 만들지 않는다.

const ORDER_CANCEL_CONFIRM_MESSAGE = '이 주문 전체를 취소할까요?';
const ORDER_CANCEL_SUCCESS_MESSAGE = '주문을 취소했습니다.';

function OrderDetailPage() {
  const { orderId } = useParams();
  const { orders, storageStatus, cancelOrder } = useOutletContext();
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  // 방금 이 화면에서 취소했을 때만 보이는 띠 — 새로고침하면 사라지고 상태 배지만 남는다
  // (예약 상세와 같은 방식)
  const [successMessage, setSuccessMessage] = useState('');

  // 저장 데이터를 읽지 못했으면 주문을 찾기 전에 먼저 돌려보낸다. 이때 orders 는 기본값의
  // 빈 배열이라, 이 검사가 없으면 `없는 주문` 으로 잘못 안내한다.
  // 주문 내역으로 보내면 거기서도 같은 오류가 나므로 주문 완료와 같이 상품 목록으로 보낸다
  if (storageStatus === 'error') {
    return (
      <div className="order-detail">
        <h1>주문 상세</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 주문 정보를 표시할 수 없습니다."
          actionLabel="상품 목록으로"
          actionTo="/products"
        />
      </div>
    );
  }

  const order = orders.find((item) => item.id === orderId);

  // 해당 주문 없음 — 정보와 취소 조작을 보이지 않는다.
  // 정의되지 않은 주소(페이지 없음)와 섞지 않는다. 주소는 맞지만 데이터가 없는 경우다
  if (!order) {
    return (
      <div className="order-detail">
        <h1>주문 상세</h1>
        <EmptyState
          message="요청한 주문을 찾을 수 없습니다."
          actionLabel="목록으로"
          actionTo="/orders"
        />
      </div>
    );
  }

  const isCancellable = order.status === 'COMPLETED';

  function handleCancelStart() {
    setCancelError(null);
    setSuccessMessage('');
    setCancelConfirmOpen(true);
  }

  // 돌아가기 — 확인 영역만 닫는다. 데이터를 바꾸지 않는다
  function handleCancelClose() {
    setCancelConfirmOpen(false);
  }

  function handleCancelConfirm() {
    setSubmitting(true);
    const result = cancelOrder(order.id);

    // 저장에 실패하면 취소됐다고 안내하지 않는다. 주문 완료 상태가 남아 다시 시도할 수 있다
    if (!result.ok) {
      setSubmitting(false);
      setCancelConfirmOpen(false);
      setCancelError(result.message);
      return;
    }

    setSubmitting(false);
    setCancelConfirmOpen(false);
    setCancelError(null);
    setSuccessMessage(ORDER_CANCEL_SUCCESS_MESSAGE);
  }

  return (
    <div className="order-detail">
      <h1>주문 상세</h1>

      <dl className="order-detail-meta">
        <div className="order-detail-meta-row">
          <dt className="order-detail-term">주문 번호</dt>
          <dd className="order-detail-desc">{order.id}</dd>
        </div>
        <div className="order-detail-meta-row">
          <dt className="order-detail-term">주문 일시</dt>
          <dd className="order-detail-desc">{formatDateTime(order.orderedAt)}</dd>
        </div>
        <div className="order-detail-meta-row">
          <dt className="order-detail-term">상태</dt>
          <dd className="order-detail-desc">
            {/* 색이 아니라 문구로도 구분한다 */}
            <StatusBadge status={order.status} type="order" />
          </dd>
        </div>
        {/* 취소 일시는 취소된 주문에만 있다 — 취소 뒤에도 상태와 일시가 남는지 여기서 확인한다 */}
        {order.cancelledAt ? (
          <div className="order-detail-meta-row">
            <dt className="order-detail-term">취소 일시</dt>
            <dd className="order-detail-desc">{formatDateTime(order.cancelledAt)}</dd>
          </div>
        ) : null}
      </dl>

      <section className="order-detail-section">
        <h2 className="order-detail-section-title">주문 상품 {order.items.length}건</h2>
        {/* 저장 시점 값을 그대로 표시한다. 취소한 뒤에도 같은 값이다 */}
        <LineItemList
          items={order.items.map((item) => ({ ...item, id: item.productId }))}
          showDiscount={true}
        />
      </section>

      <div className="order-detail-columns">
        <section className="order-detail-section">
          <h2 className="order-detail-section-title">배송 정보</h2>
          <dl className="order-detail-shipping">
            <div className="order-detail-meta-row">
              <dt className="order-detail-term">수령인</dt>
              <dd className="order-detail-desc">{order.shipping.recipientName}</dd>
            </div>
            <div className="order-detail-meta-row">
              <dt className="order-detail-term">연락처</dt>
              <dd className="order-detail-desc">{order.shipping.phone}</dd>
            </div>
            <div className="order-detail-meta-row">
              <dt className="order-detail-term">주소</dt>
              <dd className="order-detail-desc">{order.shipping.address}</dd>
            </div>
          </dl>
        </section>

        <section className="order-detail-section">
          <h2 className="order-detail-section-title">결제 금액</h2>
          <PriceSummary
            subtotal={order.subtotal}
            discountTotal={order.discountTotal}
            shippingFee={order.shippingFee}
            totalAmount={order.totalAmount}
            showDiscount={true}
          />
        </section>
      </div>

      <div className="order-detail-actions">
        <Link className="order-detail-back" to="/orders">
          목록으로
        </Link>
        {isCancellable && !isCancelConfirmOpen ? (
          <button type="button" className="order-detail-cancel" onClick={handleCancelStart}>
            주문 취소
          </button>
        ) : null}
        {successMessage ? (
          <p className="order-detail-cancel-success" role="status">
            ✓ {successMessage}
          </p>
        ) : null}
      </div>

      {isCancelConfirmOpen ? (
        <div className="order-detail-cancel-area">
          <ConfirmArea
            isOpen={isCancelConfirmOpen}
            message={ORDER_CANCEL_CONFIRM_MESSAGE}
            confirmLabel="취소 확정"
            isSubmitting={isSubmitting}
            onConfirm={handleCancelConfirm}
            onCancel={handleCancelClose}
          />
        </div>
      ) : null}

      {/* 실패 안내 — 확인 영역을 닫은 뒤 목록으로·주문 취소 버튼 바로 아래에 둔다 (예약 상세와 같은 흐름) */}
      {cancelError ? (
        <p className="order-detail-cancel-error" role="alert">
          {cancelError}
        </p>
      ) : null}
    </div>
  );
}

export { OrderDetailPage };
