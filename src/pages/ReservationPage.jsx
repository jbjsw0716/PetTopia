import { useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { FormField } from '../components/FormField.jsx';
import { QuantityInput } from '../components/QuantityInput.jsx';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockServices } from '../mocks/mockServices.js';
import { mockSitters } from '../mocks/mockSitters.js';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatDateInputValue, formatDateTime, getWeekdayKey } from '../utils/datetime.js';
import { formatWon, getReservationAmount } from '../utils/money.js';
import {
  DAY_OFF_MESSAGE,
  MAX_DAYS_AHEAD,
  MIN_DAYS_AHEAD,
  findAvailableHour,
  getEndAt,
  getMaxReservationQuantity,
  getReservationErrors,
  isWithinAvailableHours,
  usesDropOffPickUp
} from '../utils/reservation.js';
import { formatAvailableHours } from '../utils/schedule.js';
import './ReservationPage.css';

// S-09 예약서 — F-19 예약서 확인 · F-20 서비스·일정 선택 · F-21 예약 입력 검사.
// 주문서와 달리 확인 → 선택 → 검사 → 완료 네 단계가 이 화면 하나에서 끝난다.
//
// 대상 펫시터는 URL 의 :sitterId 에 담겨 있다. 서비스가 없는 펫시터는 SitterDetailPage 가
// 예약하기 버튼 자체를 내보내지 않지만, 직접 주소로 들어오는 경우를 대비해
// 여기서도 같은 조건을 다시 본다.
//
// 검사는 두 단계다 — 필수 값(항목마다 그 자리에 표시)과 업무 규칙(선택 가능 기간·이용 가능
// 시간·중복, 여러 개가 걸리면 전부 한 번에 보여준다). 업무 규칙은 utils/reservation.js 의
// getReservationErrors 하나로 화면과 Layout 이 같이 쓴다 — 같은 계산이 두 곳에 생기면 갈라진다.
//
// 이용 가능 시간을 제출 전에 미리 알려준다 — 요일별 시간표를 참고 자료로 두고, 날짜를 고르면
// 그 요일의 시간을, 시간까지 고르면 종료 예정이 그 시간 안에 드는지를 그 자리에서 보여준다.
// SitterDetailPage 를 다시 보러 나가지 않아도 되게 하기 위해서다.
// 어디까지나 안내일 뿐 검사는 아니다 — 실제 판정은 여전히 제출할 때 getReservationErrors 가 한다.

const SERVICE_ERROR = '서비스를 선택해 주세요.';
const DATE_ERROR = '날짜를 선택해 주세요.';
const TIME_ERROR = '시작 시간을 선택해 주세요.';
const QUANTITY_ERROR = '수량을 1 이상의 숫자로 입력해 주세요.';
const PET_NAME_ERROR = '반려동물 이름을 입력해 주세요.';
const PET_TYPE_ERROR = '반려동물 종류를 선택해 주세요.';
const PET_AGE_ERROR = '나이는 0 이상의 숫자로 입력해 주세요.';

// 저장된 프로필의 반려동물 정보로 기본값을 채운다 — CheckoutPage 가 배송 정보를
// 프로필에서 채우는 것과 같은 이유다. 여기서 고친 값은 이 예약 한 건에만 쓰인다.
function toPetForm(pet) {
  const source = pet || {};
  return {
    name: source.name || '',
    petType: source.petType || 'DOG',
    age: source.age === undefined || source.age === null ? '' : String(source.age),
    note: source.note || ''
  };
}

// 서비스 대상 동물 밖의 종류면 대상 동물의 첫 값으로 바꾼다.
// 산책·데이케어는 강아지만이라, 이 서비스를 고르면 종류 목록에 강아지만 남는다.
// 목록에 없는 값을 들고 있으면 선택 상자와 실제 값이 어긋나므로 값도 함께 맞춘다.
function fitPetTypeToService(pet, serviceId) {
  const service = mockServices.find((item) => item.id === serviceId);
  if (!service || service.petTypes.includes(pet.petType)) {
    return pet;
  }
  return { ...pet, petType: service.petTypes[0] };
}

// 수량 입력(문자열)을 숫자로 읽는다. 숫자만으로 된 글자일 때만 읽고 아니면 null 이다 —
// parseInt 는 '1.5' 를 1, '2abc' 를 2 로 읽어 입력과 다른 값이 저장됐다.
// 나이 검사와 같은 방식이다.
function parseQuantity(text) {
  const trimmed = text.trim();
  return /^[0-9]+$/.test(trimmed) ? Number(trimmed) : null;
}

// 검사 1 — 필수 값. 항목마다 그 입력 아래에 표시한다
function validateFields(form) {
  const errors = {};
  const service = mockServices.find((item) => item.id === form.serviceId);

  if (form.serviceId === '') {
    errors.serviceId = SERVICE_ERROR;
  }
  if (form.date === '') {
    errors.date = DATE_ERROR;
  }
  if (form.time === '') {
    errors.time = TIME_ERROR;
  }

  const quantity = parseQuantity(form.quantity);
  const maxQuantity = getMaxReservationQuantity(form.serviceId);
  if (quantity === null || quantity < 1) {
    errors.quantity = QUANTITY_ERROR;
  } else if (quantity > maxQuantity) {
    // 데이케어는 1일만 받는다 — '수량은 1일까지 입력할 수 있습니다.'
    errors.quantity = '수량은 ' + maxQuantity + (service ? service.unitLabel : '') + '까지 입력할 수 있습니다.';
  }

  if (form.pet.name.trim() === '') {
    errors.petName = PET_NAME_ERROR;
  }
  if (!Object.hasOwn(PET_TYPE_LABELS, form.pet.petType)) {
    errors.petType = PET_TYPE_ERROR;
  } else if (service && !service.petTypes.includes(form.pet.petType)) {
    errors.petType = getPetTypeNotice(service) + '.';
  }
  if (!/^[0-9]+$/.test(form.pet.age.trim())) {
    errors.petAge = PET_AGE_ERROR;
  }

  return errors;
}

// '산책 서비스는 강아지만 이용할 수 있습니다' — 대상 동물이 하나뿐인 서비스의 안내 문구
function getPetTypeNotice(service) {
  const labels = service.petTypes.map((petType) => PET_TYPE_LABELS[petType]).join('·');
  return service.name + ' 서비스는 ' + labels + '만 이용할 수 있습니다';
}

// <input type="date"> + <input type="time"> 값을 하나의 ISO 문자열로 합친다.
// 로컬 시각으로 만든 뒤 저장 형식(ISO)으로 바꾼다 — datetime.js 의 다른 함수들과 같은 전제다.
function buildStartAt(date, time) {
  return new Date(date + 'T' + time + ':00').toISOString();
}

function ReservationPage() {
  const { sitterId } = useParams();
  const { profile, reservations, storageStatus, mockDataStatus, addReservation } = useOutletContext();
  const navigate = useNavigate();

  const sitter = mockSitters.find((item) => item.id === sitterId);

  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + MIN_DAYS_AHEAD);
  const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + MAX_DAYS_AHEAD);

  // 다른 화면들과 같은 순서를 지킨다 — 조건부 반환보다 먼저 모든 훅을 부른다(CheckoutPage 와 동일).
  // sitter 가 없거나 서비스가 없을 수 있어 안전한 기본값으로 초기화한다.
  const [form, setForm] = useState(() => {
    const serviceId = sitter && sitter.services.length > 0 ? sitter.services[0].serviceId : '';
    return {
      serviceId,
      date: formatDateInputValue(minDate),
      time: '',
      quantity: '1',
      pet: fitPetTypeToService(toPetForm(profile.pet), serviceId)
    };
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [businessErrors, setBusinessErrors] = useState([]);
  const [saveError, setSaveError] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // 저장 데이터를 읽지 못하면 예약을 실행할 수 없다(CheckoutPage 와 같은 판단)
  if (storageStatus === 'error') {
    return (
      <div className="reservation">
        <h1>예약서</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 예약할 수 없습니다."
          actionLabel="펫시터 찾기로"
          actionTo="/sitters"
        />
      </div>
    );
  }

  // 기초 데이터(mock)가 어긋나면 예약을 실행하지 않는다.
  // 저장 데이터 오류와 원인이 달라 다른 문구로 안내한다
  if (mockDataStatus === 'error') {
    return (
      <div className="reservation">
        <h1>예약서</h1>
        <EmptyState
          message="기초 데이터에 오류가 있어 예약할 수 없습니다."
          actionLabel="펫시터 찾기로"
          actionTo="/sitters"
        />
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="reservation">
        <h1>예약서</h1>
        <EmptyState
          message="요청한 펫시터를 찾을 수 없습니다."
          actionLabel="펫시터 찾기로"
          actionTo="/sitters"
        />
      </div>
    );
  }

  if (sitter.services.length === 0) {
    return (
      <div className="reservation">
        <h1>예약서</h1>
        <EmptyState
          message="이 펫시터는 제공하는 서비스가 없어 예약할 수 없습니다."
          actionLabel="펫시터 상세로 돌아가기"
          actionTo={'/sitters/' + sitter.id}
        />
      </div>
    );
  }

  const region = mockRegions.find((item) => item.id === sitter.regionId);
  const service = mockServices.find((item) => item.id === form.serviceId);
  const sitterService = sitter.services.find((item) => item.serviceId === form.serviceId);

  // 날짜를 고른 시점에 그 요일이 통째로 휴무면 제출 전에 바로 안내한다(즉시 안내,
  // 제출 검사와는 다른 자리다). 날짜만으로 판단하므로 시각은 자정으로 고정해 본다.
  // 휴무가 아니면 그 요일의 이용 가능 시간을 그대로 들고 있다가 시간 입력 안내에도 쓴다.
  const selectedDayHour =
    form.date !== ''
      ? findAvailableHour(sitter.availableHours, getWeekdayKey(new Date(form.date + 'T00:00:00').toISOString()))
      : null;
  const isDayOff = form.date !== '' && !selectedDayHour;

  // 미리보기 — 선택한 값으로 계산만 해 본다. 저장은 제출했을 때만 일어난다.
  // 검사를 통과할 수 있는 수량일 때만 계산한다 — '1.5' 를 1 로 계산해 보이지 않는다
  const maxQuantity = getMaxReservationQuantity(form.serviceId);
  const previewQuantity = parseQuantity(form.quantity);
  const hasValidPreviewQuantity =
    previewQuantity !== null && previewQuantity >= 1 && previewQuantity <= maxQuantity;
  const previewAmount =
    sitterService && hasValidPreviewQuantity
      ? getReservationAmount(sitterService.price, previewQuantity)
      : 0;
  const previewStartAt = form.date !== '' && form.time !== '' ? buildStartAt(form.date, form.time) : null;
  const previewEndAt =
    previewStartAt && service && hasValidPreviewQuantity
      ? getEndAt(previewStartAt, previewQuantity, service.durationMinutes)
      : null;
  // 미리보기가 이용 가능 시간을 벗어나는지 — 제출하지 않아도 바로 알려준다.
  // 판정식은 제출 검사(검사 3)와 같은 isWithinAvailableHours 하나다 — 같은 계산이 두 곳에
  // 생기면 갈라진다. 장기 돌봄은 맡기는 시각·찾는 시각을 본다. 여기서는 안내뿐이다.
  // 그 요일이 통째로 휴무면 휴무 안내가 이미 떠 있으므로 겹쳐 붙이지 않는다.
  const isPreviewOutOfHours =
    selectedDayHour !== null &&
    previewStartAt !== null &&
    previewEndAt !== null &&
    !isWithinAvailableHours({
      serviceId: form.serviceId,
      startAt: previewStartAt,
      endAt: previewEndAt,
      availableHours: sitter.availableHours
    });

  // 제출을 한 번 시도한 항목만 입력하는 대로 다시 본다(CheckoutPage 의 handleFieldChange 와 같다).
  // 서비스를 바꾸면 수량 상한·대상 동물이 함께 바뀌므로, 이미 표시된 항목은 모두 다시 본다
  function reviseFieldErrors(nextForm) {
    if (Object.keys(fieldErrors).length === 0) {
      return;
    }
    const errors = validateFields(nextForm);
    const nextFieldErrors = {};
    for (const key of Object.keys(fieldErrors)) {
      if (errors[key]) {
        nextFieldErrors[key] = errors[key];
      }
    }
    setFieldErrors(nextFieldErrors);
  }

  function handleChange(name, value) {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    reviseFieldErrors(nextForm);
  }

  // 서비스를 바꾸면 그 서비스에 맞게 수량(데이케어는 1일)과 반려동물 종류를 함께 맞춘다
  function handleServiceChange(serviceId) {
    const nextMax = getMaxReservationQuantity(serviceId);
    const quantity = parseQuantity(form.quantity);
    const nextForm = {
      ...form,
      serviceId,
      quantity: quantity !== null && quantity > nextMax ? String(nextMax) : form.quantity,
      pet: fitPetTypeToService(form.pet, serviceId)
    };
    setForm(nextForm);
    reviseFieldErrors(nextForm);
  }

  function handlePetChange(petKey, value) {
    const nextForm = { ...form, pet: { ...form.pet, [petKey]: value } };
    setForm(nextForm);
    reviseFieldErrors(nextForm);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // 검사 1 — 필수 값이 하나라도 비면 업무 규칙 검사로 넘어가지 않는다
    const errors = validateFields(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setBusinessErrors([]);
      setSaveError(null);
      return;
    }

    const quantity = parseQuantity(form.quantity);
    const startAt = buildStartAt(form.date, form.time);
    const endAt = getEndAt(startAt, quantity, service.durationMinutes);

    // 검사 2~4 — 같은 펫시터의 완료된 예약만으로 겹침을 본다. 취소된 예약은 빼고 넘긴다
    const sitterReservations = reservations.filter(
      (item) => item.sitterId === sitter.id && item.status === 'COMPLETED'
    );
    const checkErrors = getReservationErrors({
      serviceId: form.serviceId,
      sitterReservations,
      startAt,
      endAt,
      availableHours: sitter.availableHours
    });

    if (checkErrors.length > 0) {
      setBusinessErrors(checkErrors);
      setSaveError(null);
      return;
    }

    setBusinessErrors([]);
    setSubmitting(true);

    const result = addReservation({
      sitterId: sitter.id,
      serviceId: form.serviceId,
      startAt,
      quantity,
      pet: {
        name: form.pet.name,
        petType: form.pet.petType,
        age: form.pet.age,
        note: form.pet.note
      }
    });

    if (!result.ok) {
      setSubmitting(false);
      setSaveError(result.message);
      return;
    }

    navigate('/reservation-complete/' + result.reservationId);
  }

  return (
    <div className="reservation">
      <h1>예약서</h1>

      {/* noValidate — 날짜·시간 입력에 min·max 를 걸어 뒀다(안내용). 그대로 두면 브라우저가
          자기 팝업으로 범위를 벗어났다고 막아서서, 우리가 만든 검사·표시가 뜨지도
          못한다. MyPage 의 폼과 같은 이유로 브라우저 기본 검사를 끄고 우리 쪽에서만 검사한다 */}
      <form className="reservation-form" onSubmit={handleSubmit} noValidate>
        <div className="reservation-body">
          <div className="reservation-main">
            <section className="reservation-section">
              <h2 className="reservation-section-title">예약 대상</h2>
              <dl className="reservation-meta">
                <div className="reservation-meta-row">
                  <dt>펫시터</dt>
                  <dd>{sitter.name}</dd>
                </div>
                <div className="reservation-meta-row">
                  <dt>활동 지역</dt>
                  <dd>{region ? region.name : ''}</dd>
                </div>
              </dl>
            </section>

            <section className="reservation-section">
              <h2 className="reservation-section-title">서비스·일정 선택</h2>

              <div className="reservation-hours-ref">
                <p className="reservation-hours-ref-title">요일별 이용 가능 시간</p>
                <ul className="reservation-hours-ref-list">
                  {formatAvailableHours(sitter.availableHours).map((group) => (
                    <li className="reservation-hours-ref-row" key={group.label}>
                      <span>{group.label}</span>
                      <span>{group.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <FormField
                label="서비스"
                htmlFor="reservation-service"
                required
                errorMessage={fieldErrors.serviceId}
              >
                <select
                  id="reservation-service"
                  className="reservation-input"
                  value={form.serviceId}
                  disabled={isSubmitting}
                  onChange={(event) => handleServiceChange(event.target.value)}
                >
                  {sitter.services.map((item) => {
                    const svc = mockServices.find((entry) => entry.id === item.serviceId);
                    return (
                      <option key={item.serviceId} value={item.serviceId}>
                        {svc ? svc.name : item.serviceId} · {formatWon(item.price)} /{' '}
                        {svc ? svc.unitLabel : ''}
                      </option>
                    );
                  })}
                </select>
              </FormField>

              <FormField label="날짜" htmlFor="reservation-date" required errorMessage={fieldErrors.date}>
                <input
                  id="reservation-date"
                  className="reservation-input"
                  type="date"
                  min={formatDateInputValue(minDate)}
                  max={formatDateInputValue(maxDate)}
                  value={form.date}
                  disabled={isSubmitting}
                  onChange={(event) => handleChange('date', event.target.value)}
                />
              </FormField>
              {isDayOff ? (
                <p className="reservation-day-off">{DAY_OFF_MESSAGE}</p>
              ) : selectedDayHour ? (
                <p className="reservation-day-hint">
                  이 날은 {selectedDayHour.startTime}~{selectedDayHour.endTime} 에 이용할 수 있어요.
                </p>
              ) : null}
              {/* 장기 돌봄은 맡기는 날과 찾는 날이 다르다 — 두 날 모두 시간이 맞아야 한다 */}
              {usesDropOffPickUp(form.serviceId) ? (
                <p className="reservation-day-hint">
                  장기 돌봄은 맡기는 시각과 찾는 시각이 모두 그 날의 이용 가능 시간 안이어야 해요.
                </p>
              ) : null}

              <FormField
                label="시작 시간"
                htmlFor="reservation-time"
                required
                errorMessage={fieldErrors.time}
              >
                <input
                  id="reservation-time"
                  className="reservation-input"
                  type="time"
                  // 그 요일의 이용 가능 시간으로 입력 범위를 좁혀 준다 — 정확한 검사는 아니다
                  // (수량에 따라 종료가 더 늦게 걸릴 수 있어서다). 실제 판정은 제출할 때 한다
                  min={selectedDayHour ? selectedDayHour.startTime : undefined}
                  max={selectedDayHour ? selectedDayHour.endTime : undefined}
                  value={form.time}
                  disabled={isSubmitting}
                  onChange={(event) => handleChange('time', event.target.value)}
                />
              </FormField>

              <FormField
                label={'수량' + (service ? ' (' + service.unitLabel + ' 단위)' : '')}
                required
                errorMessage={fieldErrors.quantity}
              >
                <QuantityInput
                  value={form.quantity}
                  max={maxQuantity}
                  onQuantityChange={(value) => handleChange('quantity', value)}
                />
              </FormField>
              {/* 데이케어는 1일만 받는다 — + 버튼이 꺼진 이유를 알려 준다 */}
              {service && maxQuantity === 1 ? (
                <p className="reservation-day-hint">
                  {service.name} 서비스는 한 번에 1{service.unitLabel}만 예약할 수 있어요.
                </p>
              ) : null}

              {previewEndAt ? (
                <p
                  className={
                    isPreviewOutOfHours
                      ? 'reservation-preview reservation-preview-warning'
                      : 'reservation-preview'
                  }
                >
                  종료 예정 {formatDateTime(previewEndAt)}
                  {isPreviewOutOfHours ? ' — 이 펫시터의 이용 가능 시간을 벗어나요.' : ''}
                </p>
              ) : null}
            </section>

            <section className="reservation-section">
              <h2 className="reservation-section-title">반려동물 정보</h2>

              <FormField
                label="이름"
                htmlFor="reservation-pet-name"
                required
                errorMessage={fieldErrors.petName}
              >
                <input
                  id="reservation-pet-name"
                  className="reservation-input"
                  type="text"
                  value={form.pet.name}
                  disabled={isSubmitting}
                  onChange={(event) => handlePetChange('name', event.target.value)}
                />
              </FormField>

              <FormField
                label="종류"
                htmlFor="reservation-pet-type"
                required
                errorMessage={fieldErrors.petType}
              >
                <select
                  id="reservation-pet-type"
                  className="reservation-input"
                  value={form.pet.petType}
                  disabled={isSubmitting}
                  onChange={(event) => handlePetChange('petType', event.target.value)}
                >
                  {Object.entries(PET_TYPE_LABELS)
                    .filter(([value]) => !service || service.petTypes.includes(value))
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
              </FormField>
              {service && service.petTypes.length === 1 ? (
                <p className="reservation-day-hint">{getPetTypeNotice(service)}.</p>
              ) : null}

              <FormField
                label="나이"
                htmlFor="reservation-pet-age"
                required
                errorMessage={fieldErrors.petAge}
              >
                <input
                  id="reservation-pet-age"
                  className="reservation-input"
                  type="text"
                  inputMode="numeric"
                  value={form.pet.age}
                  disabled={isSubmitting}
                  onChange={(event) => handlePetChange('age', event.target.value)}
                />
              </FormField>

              <FormField label="특이사항" htmlFor="reservation-pet-note">
                <input
                  id="reservation-pet-note"
                  className="reservation-input"
                  type="text"
                  value={form.pet.note}
                  disabled={isSubmitting}
                  onChange={(event) => handlePetChange('note', event.target.value)}
                />
              </FormField>
            </section>
          </div>

          <aside className="reservation-summary">
            <h2 className="reservation-summary-title">예상 금액</h2>
            <dl className="reservation-summary-list">
              <div className="reservation-summary-row">
                <dt>단가</dt>
                <dd>
                  {sitterService
                    ? formatWon(sitterService.price) + ' / ' + (service ? service.unitLabel : '')
                    : '-'}
                </dd>
              </div>
              <div className="reservation-summary-row">
                <dt>수량</dt>
                {/* 입력한 글자가 아니라 검사를 통과할 수 있는 숫자를 보인다 — '1.5시간' 을 보이지 않는다 */}
                <dd>
                  {hasValidPreviewQuantity
                    ? previewQuantity + (service ? service.unitLabel : '')
                    : '-'}
                </dd>
              </div>
              <div className="reservation-summary-row reservation-summary-row-total">
                <dt>예상 금액</dt>
                <dd>{formatWon(previewAmount)}</dd>
              </div>
            </dl>

            {/* 금액 · 안내 · 버튼은 한 상자에 묶여 스크롤을 따라온다.
                필수 값 오류는 각 입력 아래에 표시하는 게 원칙이지만, 그 입력이 화면 밖에
                있으면 버튼을 눌러도 아무 반응이 없는 것처럼 보인다. 각 항목의 오류 문구는
                그대로 두고, 제출 버튼 가까이에는 "확인해 달라"는 안내만 더한다 */}
            {Object.keys(fieldErrors).length > 0 ? (
              <div className="reservation-check-errors" role="alert">
                <p className="reservation-check-error">
                  입력하지 않았거나 잘못 입력한 항목이 있습니다. 입력란의 오류 문구를
                  확인해 주세요.
                </p>
              </div>
            ) : null}

            {businessErrors.length > 0 ? (
              <div className="reservation-check-errors" role="alert">
                {businessErrors.map((message) => (
                  <p key={message} className="reservation-check-error">
                    {message}
                  </p>
                ))}
              </div>
            ) : null}

            {saveError ? (
              <p className="reservation-save-error" role="alert">
                {saveError}
              </p>
            ) : null}

            <div className="reservation-actions">
              <Link className="reservation-back" to={'/sitters/' + sitter.id}>
                돌아가기
              </Link>
              <button type="submit" className="reservation-submit" disabled={isSubmitting}>
                {isSubmitting ? '예약 처리 중' : '예약하기'}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

export { ReservationPage };
