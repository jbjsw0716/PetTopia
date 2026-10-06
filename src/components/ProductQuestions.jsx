import { useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { mockProductQuestions } from '../mocks/mockProductQuestions.js';
import { formatDateTime } from '../utils/datetime.js';
import './ProductQuestions.css';

// 상품 상세 '문의' 탭.
// 날짜는 datetime.js 한 곳의 모양(2026-09-12)으로 보인다 — 저장 값(UTC 기준 ISO)을 그대로 잘라
// 쓰면 오전 9시 전에 쓴 문의가 하루 전 날짜로 보였다.
function ProductQuestions({ product }) {
  const { inquiries } = useOutletContext();
  const [category, setCategory] = useState('전체 상품 문의');
  const [isPrivateExcluded, setExcludePrivate] = useState(false);
  const dialog = useRef(null);
  const demo = mockProductQuestions.map((item) => ({ ...item, id: product.id + '-' + item.id }));
  const all = [...inquiries.filter((item) => item.productId === product.id).map((item) => ({ ...item, category: '상품', author: '나' })), ...demo];
  const filtered = all.filter((item) => (category === '전체 상품 문의' || item.category === category) && (!isPrivateExcluded || !item.isPrivate));
  const filters = <div className="question-filters"><label className="question-filter-label"><span>문의 분류</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{['전체 상품 문의','상품','배송','교환/반품','기타'].map((value) => <option key={value}>{value}</option>)}</select></label><label><input type="checkbox" checked={isPrivateExcluded} onChange={(event) => setExcludePrivate(event.target.checked)} /> 비밀글 제외</label></div>;
  function rows(items) { return items.length ? items.map((item) => item.isPrivate ? <article className="question-row" key={item.id}><small>{item.category}</small><p>🔒 비밀글입니다.</p><small>답변확인중 · {item.author.slice(0,1)}*** · {formatDateTime(item.createdAt).slice(0, 10)}</small></article> : <details className="question-row" key={item.id}><summary><small>{item.category}</small><strong>{item.title}</strong><small>{item.answer ? '답변완료' : '답변확인중'} · {item.author} · {formatDateTime(item.createdAt).slice(0, 10)}</small></summary><div className="question-answer"><p>{item.content}</p>{item.answer ? <><strong>펫토피아 답변</strong><p>{item.answer}</p></> : <p>문의가 접수되었습니다.</p>}</div></details>) : <p className="question-empty">조건에 맞는 문의가 없습니다.</p>; }
  const write = <Link className="question-write" to={`/inquiries?product=${product.id}`} onClick={() => dialog.current?.close()}>1:1 문의하기</Link>;
  return <section className="product-questions"><div className="question-heading"><h2>상품문의 ({all.length})</h2><button type="button" onClick={() => dialog.current.showModal()}>더 보기</button></div>{filters}{rows(filtered.slice(0,3))}{write}
    <dialog ref={dialog} className="question-dialog" aria-labelledby="question-dialog-title"><div className="question-heading"><h2 id="question-dialog-title">상품 문의</h2><button type="button" aria-label="상품 문의 닫기" onClick={() => dialog.current.close()}>✕</button></div>{filters}<p className="question-count">{filtered.length}개</p><div className="question-dialog-list">{rows(filtered)}</div>{write}</dialog>
  </section>;
}

export { ProductQuestions };
