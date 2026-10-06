import { useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { FormField } from '../components/FormField.jsx';
import { formatDateTime } from '../utils/datetime.js';
import { getReviewBlockReason, getReviewInputErrors } from '../utils/review.js';
import './ReviewWritePage.css';

// S-13 후기 작성 — F-25. 이용이 끝난 예약 한 건에 평점과 내용을 남긴다.
//
// 진입할 때마다 세 조건을 다시 검사한다. 버튼을 눌러 들어왔든 URL 을 직접 쳤든 같다 —
// 목록에서 버튼이 보였다는 것이 지금도 유효하다는 뜻은 아니다.
// 판정은 utils/review.js 하나로 예약 내역 · 마이페이지 · Layout 의 addReview 와 같이 쓴다.
//
// 등록에 성공했을 때만 예약 내역으로 간다. 거기서 그 예약의 `후기 쓰기` 는 조건 3에 걸려 사라진다.
// 뒤로 가기로 돌아오면 저장된 후기 때문에 `이미 후기를 씀` 이 된다 — 두 번째 후기는 생기지 않는다.

// 평점은 고르지 않은 상태에서 시작한다. 기본값을 5점으로 두면 `평점을 선택해 주세요` 가 나올 수 없다
const EMPTY_FORM = { rating: '', content: '' };
const RATING_OPTIONS = [5, 4, 3, 2, 1];

// 작성 불가 — 본문을 안내로 바꾼다.
// `취소된 예약` 을 따로 둔다 — 조건 1 에 걸리는데 다른 세 사유 중 어디에도 맞지 않고,
// `아직 이용이 끝나지 않음` 으로 묶으면 지난 날짜의 취소 예약에 틀린 안내가 된다
const BLOCKED_STATES = {
  NOT_FOUND: {
    message: '요청한 예약을 찾을 수 없습니다.',
    actionLabel: '예약 내역으로',
    actionTo: '/reservations'
  },
  CANCELLED: {
    message: '취소된 예약에는 후기를 쓸 수 없습니다.',
    actionLabel: '예약 내역으로',
    actionTo: '/reservations'
  },
  NOT_ENDED: {
    message: '종료 일시의 날짜가 지난 뒤에 후기를 쓸 수 있습니다.',
    actionLabel: '예약 내역으로',
    actionTo: '/reservations'
  },
  ALREADY_WRITTEN: {
    message: '이 예약에는 이미 후기를 썼습니다.',
    actionLabel: '이용 후기로',
    actionTo: '/reviews'
  }
};

function ReviewWritePage() {
  const { reservationId } = useParams();
  const { reservations, reviews, storageStatus, addReview } = useOutletContext();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  // 저장 데이터를 읽지 못했으면 예약을 찾기 전에 먼저 돌려보낸다. 이때 reservations 는
  // 기본값이라 RS000 이 들어 있다 — 이 검사가 없으면 읽지 못한 실제 데이터 대신 기본값 예약으로
  // 폼이 열린다 (ReservationCompletePage 와 같은 방식)
  if (storageStatus === 'error') {
    return (
      <div className="review-write">
        <h1>후기 작성</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 후기를 작성할 수 없습니다."
          actionLabel="펫시터 찾기로"
          actionTo="/sitters"
        />
      </div>
    );
  }

  const reservation = reservations.find((item) => item.id === reservationId);
  // 저장된 reviews 만 넘긴다 — mock 후기는 내 예약의 중복 판정 대상이 아니다
  const blockReason = getReviewBlockReason(reservation, reviews, new Date().toISOString());

  // 등록에 성공한 직후에는 방금 저장한 후기 때문에 판정이 `이미 후기를 씀` 이 된다.
  // 저장 결과는 곧바로 그려지고 예약 내역으로의 이동은 그 뒤에 그려지므로(라우터가 이동을 나중 순서로
  // 미룬다), 그사이 한 번은 이 화면이 다시 그려진다. 방금 여기서 등록 중이었다면 폼을 그대로 둔다 —
  // 그러지 않으면 성공했는데 `이미 후기를 썼습니다` 가 잠깐 비친다.
  // 다시 들어오면(뒤로 가기·새로고침) 화면이 새로 그려져 isSubmitting 이 false 이므로 안내가 나온다.
  const isLeaving = isSubmitting && blockReason === 'ALREADY_WRITTEN';

  // 정의되지 않은 주소(페이지 없음)와 섞지 않는다. 주소는 맞지만 쓸 수 없는 경우다
  if (blockReason !== null && !isLeaving) {
    const blocked = BLOCKED_STATES[blockReason];

    return (
      <div className="review-write">
        <h1>후기 작성</h1>
        <EmptyState
          message={blocked.message}
          actionLabel={blocked.actionLabel}
          actionTo={blocked.actionTo}
        />
      </div>
    );
  }

  // 입력은 고친 항목의 오류만 다시 본다 — 고쳐지면 그 항목의 오류가 사라지고,
  // 다른 항목의 오류와 다른 입력값은 그대로 둔다
  function handleChange(event) {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (fieldErrors[name]) {
      const errors = getReviewInputErrors(Number(nextForm.rating), nextForm.content);
      setFieldErrors({ ...fieldErrors, [name]: errors[name] });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    // 처리 중에는 다시 제출하지 않는다. 같은 후기가 두 건 생기는 것을 실제로 막는 것은
    // Layout 의 재판정(조건 3)이다
    if (isSubmitting) {
      return;
    }

    // select 의 값은 문자열이다. 숫자로 바꿔 1~5 정수인지 본다 (선택 안 함은 0 이 되어 걸린다)
    const rating = Number(form.rating);
    const errors = getReviewInputErrors(rating, form.content);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError('');
      return;
    }

    setSubmitting(true);
    const result = addReview({ reservationId: reservation.id, rating, content: form.content });

    if (!result.ok) {
      setSubmitting(false);
      setSubmitError(result.message);
      return;
    }

    navigate('/reservations');
  }

  return (
    <div className="review-write">
      <h1>후기 작성</h1>

      {/* 대상 예약 — 예약 시점에 저장한 값을 그대로 보인다. 바꿀 수 없다 */}
      <section className="review-write-target" aria-label="대상 예약">
        <p className="review-write-target-main">
          예약 번호 {reservation.id} · {reservation.sitterName} · {reservation.serviceName}
        </p>
        <p className="review-write-target-sub">
          시작 {formatDateTime(reservation.startAt)} → 종료 {formatDateTime(reservation.endAt)}
        </p>
      </section>

      <form className="review-write-form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="평점"
          htmlFor="review-write-rating"
          required
          errorMessage={fieldErrors.rating}
        >
          <select
            id="review-write-rating"
            className="review-write-select"
            name="rating"
            value={form.rating}
            onChange={handleChange}
          >
            <option value="">선택해 주세요</option>
            {RATING_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}점
              </option>
            ))}
          </select>
        </FormField>

        {/* maxLength 를 걸지 않는다 — 걸면 `500자 이하` 오류가 나올 수 없어 검사 문구로 안내한다 */}
        <FormField
          label="내용"
          htmlFor="review-write-content"
          required
          errorMessage={fieldErrors.content}
        >
          <textarea
            id="review-write-content"
            className="review-write-textarea"
            name="content"
            rows={6}
            value={form.content}
            onChange={handleChange}
          />
        </FormField>

        {/* 저장 실패만 표시한다. 동작 버튼 가까이에 둔다 */}
        {submitError ? (
          <p className="review-write-submit-error" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="review-write-actions">
          <Link className="review-write-cancel" to="/reservations">
            취소
          </Link>
          <button type="submit" className="review-write-submit" disabled={isSubmitting}>
            {isSubmitting ? '등록 처리 중' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}

export { ReviewWritePage };
