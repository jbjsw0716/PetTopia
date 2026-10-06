import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { mockSitters } from '../mocks/mockSitters.js';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockServices } from '../mocks/mockServices.js';
import { mockReviews } from '../mocks/mockReviews.js';
import { getRatingSummary, formatRating } from '../utils/rating.js';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ConfirmArea } from '../components/ConfirmArea.jsx';
import { formatDateTime, getDateOnlyTime } from '../utils/datetime.js';
import { formatWon } from '../utils/money.js';
import './ReservationDetailPage.css';

// F-40 예약 취소 — 상태가 COMPLETED 이고 시작일이 오늘보다 뒤일 때만 취소할 수 있다.
// 실제 조건은 Layout 의 cancelReservation 이 저장 직전에 다시 본다 — 여기는 버튼을 보여줄지만 정한다.
const CANCEL_CONFIRM_MESSAGE = '이 예약을 취소하시겠어요? 취소한 예약은 되돌릴 수 없습니다.';
const CANCEL_SUCCESS_MESSAGE = '예약을 취소했습니다.';

function ReservationDetailPage() {
  const { reservationId } = useParams();
  const { reservations, storageStatus, reviews, cancelReservation } = useOutletContext();
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  // 취소 버튼이 사라진 자리에 "무슨 일이 있었는지" 를 알려준다 — 팝업 대신 이 화면 안에서
  // 눈에 띄는 변화를 준다(MyPage 의 successMessage 와 같은 패턴)
  const [successMessage, setSuccessMessage] = useState('');
  const item = reservations.find((entry) => entry.id === reservationId);
  if (storageStatus === 'error') return <p role="alert">예약 정보를 불러오지 못했습니다.</p>;
  if (!item) return <div><h1>예약을 찾을 수 없습니다.</h1><Link to="/reservations">예약 내역으로</Link></div>;
  const sitter = mockSitters.find((entry) => entry.id === item.sitterId);
  const rating = getRatingSummary([...mockReviews, ...reviews], item.sitterId);
  const isCancellable =
    item.status === 'COMPLETED' &&
    getDateOnlyTime(item.startAt) > getDateOnlyTime(new Date().toISOString());

  function handleCancelStart() {
    setCancelError(null);
    setSuccessMessage('');
    setCancelConfirmOpen(true);
  }

  function handleCancelClose() {
    setCancelConfirmOpen(false);
  }

  function handleCancelConfirm() {
    setSubmitting(true);
    const result = cancelReservation(item.id);

    if (!result.ok) {
      setSubmitting(false);
      setCancelConfirmOpen(false);
      setCancelError(result.message);
      return;
    }

    setSubmitting(false);
    setCancelConfirmOpen(false);
    setCancelError(null);
    setSuccessMessage(CANCEL_SUCCESS_MESSAGE);
  }

  return (
    <div className="reservation-detail">
      <h1>예약 상세</h1>
      <Link to="/reservations">← 예약 내역</Link>
      <article className="reservation-detail-card"><div><small>{item.id}</small><h2>{item.sitterName} · {item.serviceName}</h2><p>돌봄 시작: {formatDateTime(item.startAt)}</p><p>돌봄 종료: {formatDateTime(item.endAt)}</p><p>이용 시간: {item.quantity}{item.unitLabel}</p><p>총 금액: {formatWon(item.totalAmount)}</p><h2>반려동물 정보</h2><p>{item.pet?.name} · {item.pet?.age}살</p><p>특이사항: {item.pet?.note || '없음'}</p><p>예약 접수: {formatDateTime(item.reservedAt)}</p>{item.cancelledAt && <p>취소 일시: {formatDateTime(item.cancelledAt)}</p>}</div><StatusBadge status={item.status} type="reservation" /></article>

      {cancelError ? (
        <p className="reservation-detail-cancel-error" role="alert">{cancelError}</p>
      ) : null}

      {item.status !== 'CANCELLED' && !isCancellable ? (
        <p className="reservation-detail-cancel-note">시작일이 오늘이거나 이미 지난 예약은 취소할 수 없습니다.</p>
      ) : null}

      {isCancelConfirmOpen ? (
        <div className="reservation-detail-cancel-area">
          <ConfirmArea
            isOpen={isCancelConfirmOpen}
            message={CANCEL_CONFIRM_MESSAGE}
            confirmLabel="예약 취소"
            isSubmitting={isSubmitting}
            onConfirm={handleCancelConfirm}
            onCancel={handleCancelClose}
          />
        </div>
      ) : isCancellable ? (
        <button type="button" className="reservation-detail-cancel" onClick={handleCancelStart}>예약 취소</button>
      ) : successMessage ? (
        // 방금 이 화면에서 취소를 마쳤을 때만 보인다 — 새로고침하면 사라지고 위 상태 배지만 남는다
        <p className="reservation-detail-cancel-success" role="status">✓ {successMessage}</p>
      ) : null}

      <section className="reservation-sitter-summary"><h2>담당 펫시터</h2>{sitter ? <><h3>{sitter.name}</h3><p>{sitter.career}</p><dl><div><dt>활동 지역</dt><dd>{mockRegions.find((region) => region.id === sitter.regionId)?.name}</dd></div><div><dt>돌봄 가능 동물</dt><dd>{sitter.petTypes.map((type) => PET_TYPE_LABELS[type]).join(' · ')}</dd></div><div><dt>제공 서비스</dt><dd>{sitter.services.map((service) => mockServices.find((entry) => entry.id === service.serviceId)?.name).join(' · ')}</dd></div><div><dt>보호자 평점</dt><dd>★ {formatRating(rating.average)} · 후기 {rating.count}개</dd></div></dl><Link to={`/sitters/${item.sitterId}`}>펫시터 정보 보기 →</Link></> : <p>현재 펫시터 정보를 확인할 수 없습니다. 예약 당시 담당자는 {item.sitterName}입니다.</p>}</section>
    </div>
  );
}

export { ReservationDetailPage };
