import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { mockFaqs } from '../mocks/mockFaqs.js';
import { PAGE_SIZE } from '../utils/constants.js';
import { FAQ_CATEGORIES, getFaqCategoryName } from '../utils/faqCategories.js';
import './FaqPage.css';

// S-17 자주 묻는 문의 — F-28 조회 · F-35 페이지네이션 (한 페이지 10건).
// 미리 준비된 mock 질문·답변이라 저장하지 않는다. 답변은 이 화면에서 그 자리에 펼친다.
//
// 분류를 바꾸면 1페이지로 되돌린다. 3페이지를 보다가 분류를 바꾸면 빈 화면이 된다.

function FaqPage() {
  const [categoryId, setCategoryId] = useState('all');
  const [page, setPage] = useState(1);
  // 펼쳐 둔 질문의 id. 하나만 펼친다
  const [openId, setOpenId] = useState(null);

  const matchedFaqs = mockFaqs.filter(
    (faq) => categoryId === 'all' || faq.faqCategoryId === categoryId
  );
  const start = (page - 1) * PAGE_SIZE;
  const pageFaqs = matchedFaqs.slice(start, start + PAGE_SIZE);

  function handleCategoryChange(nextCategoryId) {
    setCategoryId(nextCategoryId);
    setPage(1);
    setOpenId(null);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    setOpenId(null);
  }

  function handleToggle(faqId) {
    setOpenId(openId === faqId ? null : faqId);
  }

  let listArea;
  if (mockFaqs.length === 0) {
    // 전체 없음 — 분류 결과 없음과 다른 문구다
    listArea = <EmptyState message="등록된 자주 묻는 문의가 없습니다." />;
  } else if (matchedFaqs.length === 0) {
    listArea = (
      <EmptyState message="이 분류에는 등록된 문의가 없습니다. 다른 분류를 선택해 주세요." />
    );
  } else {
    listArea = (
      <>
        <ul className="faq-items">
          {pageFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <li className="faq-item" key={faq.id}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => handleToggle(faq.id)}
                >
                  <span className="faq-question-category">
                    {getFaqCategoryName(faq.faqCategoryId)}
                  </span>
                  <span className="faq-question-text">{faq.question}</span>
                  <span className="faq-question-mark" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen ? <p className="faq-answer">{faq.answer}</p> : null}
              </li>
            );
          })}
        </ul>

        <Pagination
          page={page}
          totalCount={matchedFaqs.length}
          onPageChange={handlePageChange}
        />
      </>
    );
  }

  return (
    <div className="faq">
      <h1>자주 묻는 문의</h1>

      <div className="faq-categories" role="group" aria-label="문의 분류">
        <button
          type="button"
          className={categoryId === 'all' ? 'faq-category is-active' : 'faq-category'}
          aria-pressed={categoryId === 'all'}
          onClick={() => handleCategoryChange('all')}
        >
          전체
        </button>
        {FAQ_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={
              categoryId === category.id ? 'faq-category is-active' : 'faq-category'
            }
            aria-pressed={categoryId === category.id}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {listArea}

      <div className="faq-more">
        <p className="faq-more-text">원하는 답이 없으신가요?</p>
        <Link className="faq-more-link" to="/inquiries">
          1:1 문의하기
        </Link>
      </div>
    </div>
  );
}

export { FaqPage };
