import { Link, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatDateTime } from '../utils/datetime.js';
import { formatWon } from '../utils/money.js';
import './ReservationCompletePage.css';

// S-10 예약 완료 — F-22 의 성공 결과를 보여준다.
//
// 이 화면은 저장된 예약을 읽어 보여줄 뿐 예약을 만들지 않는다.
// 다시 들어오거나 새로고침해도 예약이 또 생기지 않는다 (OrderCompletePage 와 같은 이유).
// 그래서 여기에는 변경 함수가 하나도 없다 — 읽는 것은 URL 의 :reservationId 와 저장된
// reservations 뿐이다.
//
// 펫시터 이름·단가 등은 예약 시점에 Layout 의 addReservation 이 복사해 둔 값 그대로이며
// 다시 계산하지 않는다 (원가 보존, OrderCompletePage 와 같은 원칙).

function ReservationCompletePage() {
  const { reservationId } = useParams();
  const { reservations, storageStatus } = useOutletContext();

  // 저장 데이터를 읽지 못한 경우는 예약이 없는 경우와 구분해 안내한다
  if (storageStatus === 'error') {
    return (
      <div className="reservation-complete">
        <h1>예약 완료</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 예약 결과를 표시할 수 없습니다."
          actionLabel="펫시터 찾기로"
          actionTo="/sitters"
        />
      </div>
    );
  }

  const reservation = reservations.find((item) => item.id === reservationId);

  // 해당 예약 없음 — 완료 문구를 표시하지 않는다. 정의되지 않은 주소와 섞지 않는다
  if (!reservation) {
    return (
      <div className="reservation-complete">
        <h1>예약 완료</h1>
        <EmptyState
          message="요청한 예약을 찾을 수 없습니다."
          actionLabel="예약 내역 보기"
          actionTo="/reservations"
        />
      </div>
    );
  }

  // 취소된 예약이면 현재 상태를 표시한다 — 완료 문구를 그대로 두면 지금 상태와 어긋난다
  const isCancelled = reservation.status === 'CANCELLED';

  return (
    <div className="reservation-complete">
      <h1 className="reservation-complete-title">
        {isCancelled ? '취소된 예약입니다' : '예약이 완료되었습니다'}
      </h1>

      <dl className="reservation-complete-meta">
        <div className="reservation-complete-meta-row">
          <dt className="reservation-complete-term">예약 번호</dt>
          <dd className="reservation-complete-desc">{reservation.id}</dd>
        </div>
        <div className="reservation-complete-meta-row">
          <dt className="reservation-complete-term">예약 접수</dt>
          <dd className="reservation-complete-desc">{formatDateTime(reservation.reservedAt)}</dd>
        </div>
        <div className="reservation-complete-meta-row">
          <dt className="reservation-complete-term">상태</dt>
          <dd className="reservation-complete-desc">
            {/* 색이 아니라 문구로도 구분한다 */}
            <StatusBadge status={reservation.status} type="reservation" />
          </dd>
        </div>
      </dl>

      <div className="reservation-complete-columns">
        <section className="reservation-complete-section">
          <h2 className="reservation-complete-section-title">예약 정보</h2>
          <dl className="reservation-complete-detail">
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">펫시터</dt>
              <dd className="reservation-complete-desc">{reservation.sitterName}</dd>
            </div>
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">서비스</dt>
              <dd className="reservation-complete-desc">{reservation.serviceName}</dd>
            </div>
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">돌봄 시작</dt>
              <dd className="reservation-complete-desc">{formatDateTime(reservation.startAt)}</dd>
            </div>
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">돌봄 종료</dt>
              <dd className="reservation-complete-desc">{formatDateTime(reservation.endAt)}</dd>
            </div>
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">이용 시간</dt>
              <dd className="reservation-complete-desc">
                {reservation.quantity}
                {reservation.unitLabel}
              </dd>
            </div>
          </dl>
        </section>

        <section className="reservation-complete-section">
          <h2 className="reservation-complete-section-title">반려동물 정보</h2>
          <dl className="reservation-complete-detail">
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">이름</dt>
              <dd className="reservation-complete-desc">{reservation.pet.name}</dd>
            </div>
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">종류·나이</dt>
              <dd className="reservation-complete-desc">
                {PET_TYPE_LABELS[reservation.pet.petType]} · {reservation.pet.age}살
              </dd>
            </div>
            <div className="reservation-complete-meta-row">
              <dt className="reservation-complete-term">특이사항</dt>
              <dd className="reservation-complete-desc">{reservation.pet.note || '없음'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="reservation-complete-section">
        <h2 className="reservation-complete-section-title">결제 금액</h2>
        <dl className="reservation-complete-amount">
          <div className="reservation-complete-meta-row">
            <dt className="reservation-complete-term">단가</dt>
            <dd className="reservation-complete-desc">
              {formatWon(reservation.unitPrice)} / {reservation.unitLabel}
            </dd>
          </div>
          <div className="reservation-complete-meta-row reservation-complete-meta-row-total">
            <dt className="reservation-complete-term">총 금액</dt>
            <dd className="reservation-complete-desc">{formatWon(reservation.totalAmount)}</dd>
          </div>
        </dl>
      </section>

      <div className="reservation-complete-actions">
        <Link className="reservation-complete-list" to="/reservations">
          예약 내역 보기
        </Link>
        <Link className="reservation-complete-continue" to="/sitters">
          다른 펫시터 보기
        </Link>
      </div>
    </div>
  );
}

export { ReservationCompletePage };
