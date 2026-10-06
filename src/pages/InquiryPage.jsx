import { useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { mockProducts } from '../mocks/mockProducts.js';
import { EmptyState } from '../components/EmptyState.jsx';
import { FormField } from '../components/FormField.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { mockInquiries } from '../mocks/mockInquiries.js';
import { PAGE_SIZE } from '../utils/constants.js';
import { formatDateTime } from '../utils/datetime.js';
import { FAQ_CATEGORIES, getFaqCategoryName } from '../utils/faqCategories.js';
import './InquiryPage.css';

// S-18 1:1 문의 — F-29 등록·내역 · F-35 페이지네이션 (한 페이지 10건).
// 작성 폼과 내 문의 내역을 한 화면에 둔다. 문의 상세는 별도 URL 이 없고 내역에서 펼쳐 본다.
//
// 내역은 mock 초기 문의(답변 완료 포함)와 저장된 문의를 합쳐 최신순으로 보인다.
// 새로 등록한 문의는 항상 `접수` 다 — 서버가 없어 답변이 달릴 수 없다.
//
// 저장이 성공했을 때만 내역을 갱신한다. 저장에 실패하면 입력을 그대로 두고 이유를 알린다.

const EMPTY_FORM = { faqCategoryId: '', title: '', content: '' };

// 분류 선택, 제목 1~50자, 내용 10~1000자 (앞뒤 공백 제거 후).
function validateInquiry(form) {
  const errors = {};
  const title = form.title.trim();
  const content = form.content.trim();

  if (form.faqCategoryId === '') {
    errors.faqCategoryId = '분류를 선택해 주세요.';
  }

  if (title.length === 0) {
    errors.title = '제목을 입력해 주세요.';
  } else if (title.length > 50) {
    errors.title = '제목은 50자 이하로 입력해 주세요.';
  }

  if (content.length < 10) {
    errors.content = '내용은 10자 이상 입력해 주세요.';
  } else if (content.length > 1000) {
    errors.content = '내용은 1000자 이하로 입력해 주세요.';
  }

  return errors;
}

function InquiryPage() {
  const { inquiries, storageStatus, addInquiry } = useOutletContext();

  const [params] = useSearchParams();
  const product = mockProducts.find((item) => item.id === params.get('product'));
  const [form, setForm] = useState(() => product ? { ...EMPTY_FORM, title: `[${product.name}] 문의`.slice(0, 50), productId: product.id } : EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  // 저장된 문의는 UTC(Z), mock 은 +09:00 이라 문자열이 아니라 시각으로 비교한다.
  const allInquiries = [...mockInquiries, ...inquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const start = (page - 1) * PAGE_SIZE;
  const pageInquiries = allInquiries.slice(start, start + PAGE_SIZE);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage('');

    const errors = validateInquiry(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError('');
      return;
    }

    // 상품 연결(productId)은 폼 값으로 넘긴다. 주소의 ?product= 를 다시 읽으면 등록 뒤 폼을 비워도
    // 이어서 쓴 일반 문의가 그 상품에 또 붙는다. 폼을 비우면 연결도 함께 풀린다.
    const result = addInquiry(form);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    // 등록 성공 — 폼을 비우고 내역을 1페이지로 되돌려 새 문의를 보여 준다
    setForm(EMPTY_FORM);
    setSubmitError('');
    setPage(1);
    setOpenId(result.inquiryId);
    setSuccessMessage('문의가 등록되었습니다. 상태는 접수입니다.');
  }

  function handleToggle(inquiryId) {
    setOpenId(openId === inquiryId ? null : inquiryId);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    setOpenId(null);
  }

  return (
    <div className="inquiry">
      <h1>1:1 문의</h1>

      {/* 저장 데이터를 읽지 못한 경우 — 문의 없음과 다른 문구로 알린다 */}
      {storageStatus === 'error' ? (
        <p className="inquiry-storage-error" role="alert">
          저장 데이터를 불러오지 못해 문의를 등록할 수 없고, 내가 등록한 문의도 보이지 않습니다.
        </p>
      ) : null}

      <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="분류"
          htmlFor="inquiry-category"
          required
          errorMessage={fieldErrors.faqCategoryId}
        >
          <select
            id="inquiry-category"
            className="inquiry-select"
            name="faqCategoryId"
            value={form.faqCategoryId}
            onChange={handleChange}
          >
            <option value="">선택해 주세요</option>
            {FAQ_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="제목"
          htmlFor="inquiry-title"
          required
          errorMessage={fieldErrors.title}
        >
          <input
            id="inquiry-title"
            className="inquiry-input"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
        </FormField>

        <FormField
          label="내용"
          htmlFor="inquiry-content"
          required
          errorMessage={fieldErrors.content}
        >
          <textarea
            id="inquiry-content"
            className="inquiry-textarea"
            name="content"
            rows={6}
            value={form.content}
            onChange={handleChange}
          />
        </FormField>

        <button type="submit" className="inquiry-submit">
          등록
        </button>

        {submitError ? (
          <p className="inquiry-submit-error" role="alert">
            {submitError}
          </p>
        ) : null}
        {successMessage ? <p className="inquiry-success">{successMessage}</p> : null}
      </form>

      <h2 className="inquiry-history-title">내 문의 내역</h2>

      {allInquiries.length === 0 ? (
        <EmptyState message="등록된 문의가 없습니다." />
      ) : (
        <>
          <ul className="inquiry-items">
            {pageInquiries.map((inquiry) => {
              const isOpen = openId === inquiry.id;

              return (
                <li className="inquiry-item" key={inquiry.id}>
                  <button
                    type="button"
                    className="inquiry-item-head"
                    aria-expanded={isOpen}
                    onClick={() => handleToggle(inquiry.id)}
                  >
                    <span className="inquiry-item-id">{inquiry.id}</span>
                    <span className="inquiry-item-category">
                      {getFaqCategoryName(inquiry.faqCategoryId)}
                    </span>
                    <span className="inquiry-item-title">{inquiry.title}</span>
                    <span className="inquiry-item-date">
                      {formatDateTime(inquiry.createdAt).slice(0, 10)}
                    </span>
                    <StatusBadge status={inquiry.status} type="inquiry" />
                  </button>

                  {isOpen ? (
                    <div className="inquiry-item-body">
                      <p className="inquiry-item-label">문의 내용</p>
                      <p className="inquiry-item-text">{inquiry.content}</p>
                      <p className="inquiry-item-label">답변</p>
                      <p className="inquiry-item-text">
                        {inquiry.answer ? inquiry.answer : '아직 답변이 등록되지 않았습니다.'}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <Pagination
            page={page}
            totalCount={allInquiries.length}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <div className="inquiry-more">
        <Link className="inquiry-more-link" to="/faq">
          자주 묻는 문의 보기
        </Link>
      </div>
    </div>
  );
}

export { InquiryPage };
