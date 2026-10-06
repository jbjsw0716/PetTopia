import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { FormField } from '../components/FormField.jsx';
import { LineItemList } from '../components/LineItemList.jsx';
import { PriceSummary } from '../components/PriceSummary.jsx';
import { normalizePhone } from '../utils/phone.js';
import './CheckoutPage.css';

// S-04 주문서 — F-10 주문 내용 확인 · F-11 배송 정보 입력·검사 · F-12 주문 실행.
// F-37 배송비 · F-38 연락처 형식 · F-45 할인 표시가 함께 걸린다.
//
// 여기서 대상을 고르지 않는다 — 장바구니에서 고른 상품이 주문 대상이다.
// 주문서로 넘어온 뒤에는 대상이 고정된다. 바꾸려면 장바구니로 돌아가 다시 들어온다.
// 여기에서 수량을 바꾸지 않는다. 고치려면 장바구니로 돌아간다.
//
// 주문 대상은 Layout 의 checkoutDraft 에 있다. 저장하지 않으므로 새로고침·직접 접근에서
// 사라지고, 그때는 `주문 대상 없음` 을 표시한다 — 주문서만 URL 로 복원할 수 없는 화면이다.

const PHONE_FORMAT_ERROR = '휴대전화 번호를 010-0000-0000 형식으로 입력해 주세요.';

const FIELDS = [
  {
    name: 'recipientName',
    label: '수령인 이름',
    emptyError: '수령인 이름을 입력해 주세요.',
    placeholder: ''
  },
  {
    name: 'phone',
    label: '연락처',
    emptyError: '연락처를 입력해 주세요.',
    // label 을 대신하는 것이 아니라 함께 둔다
    placeholder: '010-0000-0000'
  },
  {
    name: 'address',
    label: '주소',
    emptyError: '주소를 입력해 주세요.',
    placeholder: ''
  }
];

// 한 항목만 검사한다. 값이 올바르게 고쳐지면 그 오류만 해제하기 위해서다.
// 빈 값을 먼저 잡는다. 같은 자리에 빈 값 문구와 형식 문구를 함께 띄우지 않는다.
function validateField(field, value) {
  if (value.trim() === '') {
    return field.emptyError;
  }
  if (field.name === 'phone' && normalizePhone(value) === null) {
    return PHONE_FORMAT_ERROR;
  }
  return null;
}

function CheckoutPage() {
  const { checkoutDraft, profile, storageStatus, placeOrder } = useOutletContext();
  const navigate = useNavigate();

  // 배송 정보의 기본값은 저장된 프로필에서 채우되 지울 수 있어야 한다.
  // 초기화 함수로 한 번만 읽는다. 프로필을 계속 따라가면 사용자가 지운 값이 되살아난다.
  // 여기서 고친 값은 이 주문 한 건에만 저장되며 프로필을 바꾸지 않는다.
  const [shippingInput, setShippingInput] = useState(() => ({
    recipientName: profile.name,
    phone: profile.phone,
    address: profile.address
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  // 성공했을 때는 되돌리지 않는다 — 완료 화면으로 이동하므로 다시 누를 자리가 없다.
  const [isSubmitting, setSubmitting] = useState(false);

  // 저장 데이터를 읽지 못한 경우는 데이터가 없는 경우와 구분해 안내한다.
  // 헤더 아래 안내는 Layout 이 갖고, 여기서는 주문을 실행할 수 없다는 것을 알린다.
  if (storageStatus === 'error') {
    return (
      <div className="checkout">
        <h1>주문서</h1>
        <EmptyState
          message="저장 데이터를 불러오지 못해 주문할 수 없습니다."
          actionLabel="장바구니로"
          actionTo="/cart"
        />
      </div>
    );
  }

  if (!checkoutDraft) {
    return (
      <div className="checkout">
        <h1>주문서</h1>
        <EmptyState
          message="장바구니에서 주문할 상품을 선택해 주세요."
          actionLabel="장바구니로"
          actionTo="/cart"
        />
      </div>
    );
  }

  function handleFieldChange(field, value) {
    setShippingInput({ ...shippingInput, [field.name]: value });

    // 이미 오류가 붙은 항목만 다시 본다. 아직 제출하지 않은 항목에 미리 오류를 띄우지 않는다
    if (!fieldErrors[field.name]) {
      return;
    }

    const nextErrors = { ...fieldErrors };
    const message = validateField(field, value);

    if (message === null) {
      delete nextErrors[field.name];
    } else {
      nextErrors[field.name] = message;
    }

    setFieldErrors(nextErrors);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    for (const field of FIELDS) {
      const message = validateField(field, shippingInput[field.name]);
      if (message !== null) {
        nextErrors[field.name] = message;
      }
    }
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSaveError(null);
      return;
    }

    setSubmitting(true);
    const result = placeOrder(checkoutDraft, shippingInput);

    if (!result.ok) {
      setSubmitting(false);
      setSaveError(result.message);
      return;
    }

    navigate('/order-complete/' + result.orderId);
  }

  return (
    <div className="checkout">
      <h1>주문서</h1>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-body">
          <div className="checkout-main">
            <section className="checkout-section">
              <h2 className="checkout-section-title">주문 상품</h2>
              {/* LineItemList 는 항목마다 id 를 쓴다. 주문 항목의 키는 productId 라
                  화면에서 맞춰 넘긴다 */}
              <LineItemList
                items={checkoutDraft.items.map((item) => ({
                  ...item,
                  id: item.productId
                }))}
                showDiscount={true}
              />
            </section>

            <section className="checkout-section">
              <h2 className="checkout-section-title">배송 정보</h2>
              {FIELDS.map((field) => (
                <FormField
                  key={field.name}
                  label={field.label}
                  htmlFor={'checkout-' + field.name}
                  required={true}
                  errorMessage={fieldErrors[field.name]}
                >
                  <input
                    id={'checkout-' + field.name}
                    className="checkout-input"
                    type="text"
                    value={shippingInput[field.name]}
                    placeholder={field.placeholder}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      handleFieldChange(field, event.target.value)
                    }
                  />
                </FormField>
              ))}
            </section>
          </div>

          <aside className="checkout-summary">
            <h2 className="checkout-summary-title">결제 예정 금액</h2>
            {/* 계산은 money.js 가 초안을 만들 때 끝냈다. 여기서는 표시만 한다 */}
            <PriceSummary
              subtotal={checkoutDraft.subtotal}
              discountTotal={checkoutDraft.discountTotal}
              shippingFee={checkoutDraft.shippingFee}
              totalAmount={checkoutDraft.totalAmount}
              showDiscount={true}
            />

            {/* 금액 · 안내 · 버튼은 한 상자에 묶여 스크롤을 따라온다
                (CheckoutPage.css — 예약서와 같은 모양) */}
            {/* 오류가 난 입력칸이 화면 밖에 있을 수 있어 버튼 가까이에서도 알린다 */}
            {Object.keys(fieldErrors).length > 0 ? (
              <p className="checkout-validation-message" role="alert">
                입력하지 않았거나 잘못 입력한 항목이 있습니다. 입력란의 오류 문구를 확인해 주세요.
              </p>
            ) : null}

            {/* 주문 내용이 달라졌거나 저장이 실패했을 때 표시한다. 성공 안내로 대체하지 않는다 */}
            {saveError ? (
              <p className="checkout-save-error" role="alert">
                {saveError}
              </p>
            ) : null}

            <div className="checkout-actions">
              <Link className="checkout-back" to="/cart">
                장바구니로 돌아가기
              </Link>
              <button type="submit" className="checkout-submit" disabled={isSubmitting}>
                {isSubmitting ? '주문 처리 중' : '주문 완료'}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

export { CheckoutPage };
