import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatDateTime } from '../utils/datetime.js';
import { formatWon } from '../utils/money.js';
import { getReviewBlockReason } from '../utils/review.js';
import './ReservationListPage.css';

function ReservationListPage() {
  const { reservations, reviews, storageStatus, reviewNoticeId } = useOutletContext();
  const [filter, setFilter] = useState('all');
  const items = [...reservations].filter((item) => filter === 'all' || item.status === filter).sort((a, b) => Date.parse(b.reservedAt) - Date.parse(a.reservedAt));
  const nowIso = new Date().toISOString();

  // F-25 `후기 쓰기` — 세 조건(예약 완료 · 종료 일시의 날짜가 오늘보다 이전 · 그 예약의 후기 없음)을
  // 모두 만족한 카드에만 보인다. 하나라도 어긋나면 내보내지 않는다(비활성으로 두지 않는다).
  // 판정은 utils/review.js 하나로 후기 작성 화면 · 마이페이지와 같이 쓴다.
  // 이미 후기를 쓴 예약은 버튼 대신 `후기 작성 완료` 를 보인다 — 후기 작성 화면에서 등록하고
  // 돌아왔을 때의 결과 안내다. 저장된 reviews 에서 나오므로 새로고침해도 사실과 맞는다
  function renderReviewAction(item) {
    const blockReason = getReviewBlockReason(item, reviews, nowIso);
    if (blockReason === null) {
      return <Link className="reservation-card-review" to={`/reviews/write/${item.id}`}>후기 쓰기 →</Link>;
    }
    if (blockReason === 'ALREADY_WRITTEN') {
      return <span className="reservation-card-reviewed">후기 작성 완료</span>;
    }
    return null;
  }

  return (
    <div className="reservation-list">
      <h1>예약 내역</h1>
      <p>우리 아이의 돌봄 일정과 예약 정보를 확인하세요.</p>
      {/* 후기 작성 화면에서 후기를 등록하고 돌아왔을 때만 보인다. 새로고침하거나 다른 화면에
          가면 사라지고, 카드의 '후기 작성 완료' 만 남는다 — 주문·예약 취소 띠와 같다 */}
      {reviewNoticeId && (
        <p className="reservation-list-notice" role="status">
          ✓ {reviewNoticeId} 예약의 후기를 등록했습니다.
        </p>
      )}
      {storageStatus === 'error' ? <p role="alert">저장 데이터를 불러오지 못해 예약을 표시할 수 없습니다.</p> : <>
        <div className="reservation-list-toolbar"><span>전체 {reservations.length}건 · 조회 {items.length}건</span><label>예약 상태 <select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">전체</option><option value="COMPLETED">예약 완료</option><option value="CANCELLED">취소</option></select></label></div>
        {/* 예약이 없는 것과 상태 필터 결과가 없는 것은 다른 상태다 — 같은 문구면 예약이 있는데도
            없는 것처럼 보이고, 필터를 바꾸라는 안내가 없다 */}
        {items.length ? items.map((item) => <article className="reservation-card" key={item.id}><div><small>{item.id} · 예약일 {formatDateTime(item.reservedAt)}</small><h2>{item.sitterName} · {item.serviceName}</h2><p>{formatDateTime(item.startAt)} ~ {formatDateTime(item.endAt)}</p><p>{item.pet?.name} · {item.quantity}{item.unitLabel} · {formatWon(item.totalAmount)}</p></div><div className="reservation-card-actions"><StatusBadge status={item.status} type="reservation" /><Link to={`/reservations/${item.id}`}>예약 상세 보기 →</Link>{renderReviewAction(item)}</div></article>)
          : reservations.length === 0 ? <div className="reservation-empty"><h2>예약 내역이 없습니다.</h2><Link to="/sitters">펫시터 둘러보기 →</Link></div>
            : <div className="reservation-empty"><h2>조건에 맞는 예약이 없습니다.</h2><p>예약 상태를 바꿔 보세요.</p></div>}
      </>}
    </div>
  );
}

export { ReservationListPage };
