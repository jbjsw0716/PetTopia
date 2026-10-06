import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { mockProducts } from '../mocks/mockProducts.js';
import { mockCategories } from '../mocks/mockCategories.js';
import { FormField } from '../components/FormField.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { mockInquiries } from '../mocks/mockInquiries.js';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatDateTime } from '../utils/datetime.js';
import { getFaqCategoryName } from '../utils/faqCategories.js';
import { formatWon, getDiscountedPrice } from '../utils/money.js';
import { normalizePhone } from '../utils/phone.js';
import { getReviewBlockReason } from '../utils/review.js';
import './MyPage.css';

// S-19 마이페이지 — F-30 프로필 수정 · F-38 연락처 형식 · F-31 찜한 상품 건수.
// 위에는 내 정보·반려동물 정보, 아래에는 주문·예약·문의의 최근 몇 건과 건수를 모아 보인다.
//
// 내 정보는 평소에 값만 보이고, `수정` 을 눌러야 입력창이 열린다.
// `취소` 는 고친 값을 버리고 저장된 값으로 돌아간다. 저장에 성공했을 때만 다시 값 보기로 돌아간다.
//
// 마이페이지는 허브다. 각 목록의 정렬 규칙은 원래 화면(주문 내역 · 예약 내역 · 1:1 문의)을 그대로
// 따르고 여기서 새로 정하지 않는다 — 규칙이 두 곳에 생기면 두 화면의 목록이 서로 달라진다.
// 찜한 상품은 찜한 상품 화면이 등록 순서(오래된 것부터)라, 여기서는 그 끝에서 최근 몇 건을 떼어
// 다른 세 영역처럼 최신 것을 위에 둔다.

// 영역마다 보여 주는 최근 건수 ("최근 몇 건")
const RECENT_COUNT = 3;

// 저장된 프로필을 입력창 값(문자열)으로 바꾼다. 나이도 입력창에서는 문자열이다
function toForm(profile) {
  const pet = profile.pet || {};

  return {
    name: profile.name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    petName: pet.name || '',
    petType: pet.petType || 'DOG',
    petAge: pet.age === undefined || pet.age === null ? '' : String(pet.age),
    petNote: pet.note || ''
  };
}

// 이름·연락처·주소는 비울 수 없고, 반려동물은 이름과 종류가 필요하다.
// 연락처 형식은 배송 정보와 같은 규칙을 쓴다. 빈 값은 필수 값 검사가 먼저 잡고
// 같은 자리에 두 문구를 함께 띄우지 않는다.
function validateProfile(form) {
  const errors = {};

  if (form.name.trim() === '') {
    errors.name = '이름을 입력해 주세요.';
  }

  if (form.phone.trim() === '') {
    errors.phone = '연락처를 입력해 주세요.';
  } else if (normalizePhone(form.phone) === null) {
    errors.phone = '연락처는 010 으로 시작하는 숫자 11자리로 입력해 주세요. 예: 010-0000-0000';
  }

  if (form.address.trim() === '') {
    errors.address = '주소를 입력해 주세요.';
  }

  if (form.petName.trim() === '') {
    errors.petName = '반려동물 이름을 입력해 주세요.';
  }

  if (!Object.hasOwn(PET_TYPE_LABELS, form.petType)) {
    errors.petType = '반려동물 종류를 선택해 주세요.';
  }

  // 나이는 0 이상의 정수
  if (!/^[0-9]+$/.test(form.petAge.trim())) {
    errors.petAge = '나이는 0 이상의 숫자로 입력해 주세요.';
  }

  return errors;
}

// 같은 시각이면 번호가 큰 쪽을 앞에 둔다. 번호는 커지기만 하므로 그쪽이 최신이다 (주문 내역과 같다)
function byLatest(getTime) {
  return (a, b) => {
    const gap = getTime(b) - getTime(a);
    if (gap !== 0) {
      return gap;
    }
    return b.id < a.id ? -1 : 1;
  };
}

function MyPage() {
  const {
    profile,
    orders,
    reservations,
    reviews,
    inquiries,
    wishlistProductIds,
    storageStatus,
    updateProfile
  } = useOutletContext();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => toForm(profile));
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 저장 데이터를 읽지 못한 상태에서는 프로필 수정을 막는다 — 그대로 저장하면 읽지 못한
  // 기존 데이터를 덮어쓴다. 이때 화면에는 고정 사용자 기본값이 보인다.
  const isLocked = storageStatus === 'error';

  function handleEditStart() {
    if (isLocked) {
      return;
    }
    setForm(toForm(profile));
    setFieldErrors({});
    setSubmitError('');
    setSuccessMessage('');
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(toForm(profile));
    setFieldErrors({});
    setSubmitError('');
    setIsEditing(false);
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage('');

    if (isLocked) {
      return;
    }

    const errors = validateProfile(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError('');
      return;
    }

    const result = updateProfile({
      name: form.name,
      phone: form.phone,
      address: form.address,
      pet: {
        name: form.petName,
        petType: form.petType,
        age: form.petAge,
        note: form.petNote
      }
    });

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    // 저장 성공 — 입력창을 닫고 저장된 값을 보인다 (연락처는 하이픈이 들어간 모양)
    setForm(toForm(result.profile));
    setSubmitError('');
    setIsEditing(false);
    setSuccessMessage('내 정보를 저장했습니다.');
  }

  // 값 보기에 쓰는 표시 값. 저장된 프로필을 그대로 보인다
  const pet = profile.pet || {};
  const petTypeLabel = PET_TYPE_LABELS[pet.petType] || '';

  const sortedOrders = [...orders].sort(byLatest((order) => Date.parse(order.orderedAt)));
  const sortedReservations = [...reservations].sort(
    byLatest((reservation) => Date.parse(reservation.reservedAt))
  );
  // `후기 쓰기` 는 예약 내역과 같은 판정으로 보인다. 판정은 utils/review.js 하나다
  const nowIso = new Date().toISOString();
  // 1:1 문의 화면과 같이 mock 초기 문의와 저장된 문의를 합쳐 센다
  const allInquiries = [...mockInquiries, ...inquiries].sort(
    byLatest((inquiry) => Date.parse(inquiry.createdAt))
  );

  return (
    <div className="mypage">
      <h1>마이페이지</h1>

      {/* 불러오기 실패 — 수정 잠금. 데이터가 없는 경우와 구분되는 문구다 */}
      {isLocked ? (
        <p className="mypage-locked" role="alert">
          저장 데이터를 불러오지 못해 내 정보를 수정할 수 없습니다. 아래는 기본으로 보이는 값입니다.
        </p>
      ) : null}

      {isEditing ? (
        <form className="mypage-form" onSubmit={handleSubmit} noValidate>
          <h2 className="mypage-section-title">내 정보</h2>

          <FormField label="이름" htmlFor="mypage-name" required errorMessage={fieldErrors.name}>
            <input
              id="mypage-name"
              className="mypage-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            label="연락처"
            htmlFor="mypage-phone"
            required
            errorMessage={fieldErrors.phone}
          >
            <input
              id="mypage-phone"
              className="mypage-input"
              type="text"
              name="phone"
              placeholder="010-0000-0000"
              value={form.phone}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            label="주소"
            htmlFor="mypage-address"
            required
            errorMessage={fieldErrors.address}
          >
            <input
              id="mypage-address"
              className="mypage-input"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </FormField>

          <h2 className="mypage-section-title">반려동물 정보</h2>

          <FormField
            label="이름"
            htmlFor="mypage-pet-name"
            required
            errorMessage={fieldErrors.petName}
          >
            <input
              id="mypage-pet-name"
              className="mypage-input"
              type="text"
              name="petName"
              value={form.petName}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            label="종류"
            htmlFor="mypage-pet-type"
            required
            errorMessage={fieldErrors.petType}
          >
            <select
              id="mypage-pet-type"
              className="mypage-input"
              name="petType"
              value={form.petType}
              onChange={handleChange}
            >
              {Object.entries(PET_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="나이"
            htmlFor="mypage-pet-age"
            required
            errorMessage={fieldErrors.petAge}
          >
            <input
              id="mypage-pet-age"
              className="mypage-input"
              type="text"
              inputMode="numeric"
              name="petAge"
              value={form.petAge}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="특이사항" htmlFor="mypage-pet-note">
            <input
              id="mypage-pet-note"
              className="mypage-input"
              type="text"
              name="petNote"
              value={form.petNote}
              onChange={handleChange}
            />
          </FormField>

          <div className="mypage-actions">
            <button type="submit" className="mypage-submit">
              저장
            </button>
            <button type="button" className="mypage-cancel" onClick={handleCancel}>
              취소
            </button>
          </div>

          {submitError ? (
            <p className="mypage-submit-error" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>
      ) : (
        <section className="mypage-profile">
          <h2 className="mypage-section-title">내 정보</h2>

          <dl className="mypage-profile-list">
            <div className="mypage-profile-row">
              <dt>이름</dt>
              <dd>{profile.name}</dd>
            </div>
            <div className="mypage-profile-row">
              <dt>연락처</dt>
              <dd>{profile.phone}</dd>
            </div>
            <div className="mypage-profile-row">
              <dt>주소</dt>
              <dd>{profile.address}</dd>
            </div>
          </dl>

          <h2 className="mypage-section-title">반려동물 정보</h2>

          <dl className="mypage-profile-list">
            <div className="mypage-profile-row">
              <dt>이름</dt>
              <dd>{pet.name}</dd>
            </div>
            <div className="mypage-profile-row">
              <dt>종류</dt>
              <dd>{petTypeLabel}</dd>
            </div>
            <div className="mypage-profile-row">
              <dt>나이</dt>
              <dd>{pet.age === undefined || pet.age === null ? '' : pet.age + '살'}</dd>
            </div>
            <div className="mypage-profile-row">
              <dt>특이사항</dt>
              <dd>{pet.note ? pet.note : '없음'}</dd>
            </div>
          </dl>

          {/* 내 정보 제목 오른쪽에 수정 버튼을 배치한다. */}
          <button
            type="button"
            className="mypage-edit"
            disabled={isLocked}
            onClick={handleEditStart}
          >
            수정
          </button>

          {successMessage ? <p className="mypage-success">{successMessage}</p> : null}
        </section>
      )}

      {!isEditing && <>
      <h2 className="mypage-summary-title">내역 모아 보기</h2>

      {/* 영역마다 따로 비어 있음을 안내한다. 주문이 없다고 화면 전체를 비우지 않는다 */}
      <div className="mypage-areas">
        <section className="mypage-area">
          <div className="mypage-area-head">
            <h3 className="mypage-area-title">
              주문 내역
              {isLocked ? null : <span className="mypage-area-count">{orders.length}건</span>}
            </h3>
            {isLocked ? null : (
              <Link className="mypage-area-more" to="/orders">
                더 보기
              </Link>
            )}
          </div>

          {isLocked ? (
            <p className="mypage-area-empty">저장 데이터를 불러오지 못해 표시할 수 없습니다.</p>
          ) : sortedOrders.length === 0 ? (
            <p className="mypage-area-empty">주문 내역이 없습니다.</p>
          ) : (
            <ul className="mypage-area-list">
              {sortedOrders.slice(0, RECENT_COUNT).map((order) => (
                <li className="mypage-area-row" key={order.id}>
                  <span className="mypage-area-id">{order.id}</span>
                  <span className="mypage-area-main">
                    {order.items[0].name}
                    {order.items.length > 1 ? ' 외 ' + (order.items.length - 1) + '건' : ''}
                  </span>
                  <span className="mypage-area-sub">{formatWon(order.totalAmount)}</span>
                  <span className="mypage-area-sub">{formatDateTime(order.orderedAt)}</span>
                  <StatusBadge status={order.status} type="order" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mypage-area">
          <div className="mypage-area-head">
            <h3 className="mypage-area-title">
              예약 내역
              {isLocked ? null : (
                <span className="mypage-area-count">{reservations.length}건</span>
              )}
            </h3>
            {isLocked ? null : (
              <Link className="mypage-area-more" to="/reservations">
                더 보기
              </Link>
            )}
          </div>

          {isLocked ? (
            <p className="mypage-area-empty">저장 데이터를 불러오지 못해 표시할 수 없습니다.</p>
          ) : sortedReservations.length === 0 ? (
            <p className="mypage-area-empty">예약 내역이 없습니다.</p>
          ) : (
            <ul className="mypage-area-list">
              {sortedReservations.slice(0, RECENT_COUNT).map((reservation) => (
                <li className="mypage-area-row" key={reservation.id}>
                  <span className="mypage-area-id">{reservation.id}</span>
                  <span className="mypage-area-main">
                    {reservation.sitterName} · {reservation.serviceName}
                  </span>
                  <span className="mypage-area-sub">{formatDateTime(reservation.startAt)}</span>
                  <StatusBadge status={reservation.status} type="reservation" />
                  {getReviewBlockReason(reservation, reviews, nowIso) === null ? (
                    <Link
                      className="mypage-area-review"
                      to={`/reviews/write/${reservation.id}`}
                    >
                      후기 쓰기
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mypage-area">
          <div className="mypage-area-head">
            <h3 className="mypage-area-title">
              내 문의 내역
              {isLocked ? null : (
                <span className="mypage-area-count">{allInquiries.length}건</span>
              )}
            </h3>
            {isLocked ? null : (
              <Link className="mypage-area-more" to="/inquiries">
                더 보기
              </Link>
            )}
          </div>

          {isLocked ? (
            <p className="mypage-area-empty">저장 데이터를 불러오지 못해 표시할 수 없습니다.</p>
          ) : allInquiries.length === 0 ? (
            <p className="mypage-area-empty">등록한 문의가 없습니다.</p>
          ) : (
            <ul className="mypage-area-list">
              {allInquiries.slice(0, RECENT_COUNT).map((inquiry) => (
                <li className="mypage-area-row" key={inquiry.id}>
                  <span className="mypage-area-id">{inquiry.id}</span>
                  <span className="mypage-area-main">
                    [{getFaqCategoryName(inquiry.faqCategoryId)}] {inquiry.title}
                  </span>
                  <span className="mypage-area-sub">
                    {formatDateTime(inquiry.createdAt).slice(0, 10)}
                  </span>
                  <StatusBadge status={inquiry.status} type="inquiry" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mypage-area">
          <div className="mypage-area-head">
            <h3 className="mypage-area-title">
              찜한 상품
              {isLocked ? null : (
                <span className="mypage-area-count">{wishlistProductIds.length}건</span>
              )}
            </h3>
            {isLocked ? null : (
              <Link className="mypage-area-more" to="/wishlist">
                더 보기
              </Link>
            )}
          </div>

          {isLocked ? (
            <p className="mypage-area-empty">저장 데이터를 불러오지 못해 표시할 수 없습니다.</p>
          ) : wishlistProductIds.length === 0 ? (
            <p className="mypage-area-empty">찜한 상품이 없습니다.</p>
          ) : <ul className="mypage-area-list">{wishlistProductIds.slice(-RECENT_COUNT).reverse().map((id) => {
            const product = mockProducts.find((item) => item.id === id);
            return <li className="mypage-area-row" key={id}><span className="mypage-area-id">{id}</span>{product ? <><Link className="mypage-area-main" to={`/products/${id}`}>{product.name}</Link><span className="mypage-area-sub">{mockCategories.find((item) => item.id === product.categoryId)?.name}</span><span className="mypage-area-sub">{formatWon(getDiscountedPrice(product.price, product.discountPercent))}</span></> : <span>현재 판매하지 않는 상품입니다.</span>}</li>;
          })}</ul>}
        </section>
      </div>
      </>}
    </div>
  );
}

export { MyPage };
