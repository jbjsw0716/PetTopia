import { useEffect, useId, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { assistantExamples } from '../mocks/mockAssistant.js';
import { mockCategories } from '../mocks/mockCategories.js';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockServices } from '../mocks/mockServices.js';
import { getAssistantReply } from '../utils/assistant.js';
import { formatWon } from '../utils/money.js';
import { getProductRating } from '../utils/productRating.js';
import './AssistantPage.css';

// 두 자리에서 그려진다 — /assistant 주소(Outlet 안)와 모든 화면의 떠 있는 도우미(Outlet 밖).
// Outlet 밖에서는 useOutletContext 가 null 이라 떠 있는 도우미에는 Layout 이 리뷰 목록을 props 로
// 넘긴다. 주소로 열었을 때는 props 가 없으니 Outlet context 에서 받는다.
function AssistantPage({ allProductReviews = null }) {
  const outletContext = useOutletContext();
  const productReviews =
    allProductReviews !== null ? allProductReviews : outletContext.allProductReviews;
  const questionId = useId();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const latestRef = useRef(null);
  const nextMessageIdRef = useRef(1);
  useEffect(() => { latestRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);

  function ask(question) {
    if (!question.trim()) return;
    const id = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    setMessages((previous) => [...previous, { id, question: question.trim(), reply: getAssistantReply(question) }]);
    setInput('');
  }

  return (
    <div className="assistant-page">
      <header className="assistant-heading"><p className="eyebrow">PETTOPIA ASSISTANT</p><h1>어떤 도움이 필요하세요?</h1><p>우리 아이에게 맞는 상품과 펫시터를 문장으로 찾아보세요.</p><small>등록된 상품·펫시터·FAQ를 검색하는 자동 추천 서비스입니다. 대화는 새로고침하면 사라집니다.</small></header>
      <div className="assistant-examples" aria-label="추천 질문">{assistantExamples.map((example) => <button type="button" key={example} onClick={() => ask(example)}>{example} ↗</button>)}</div>
      <div className="assistant-conversation" role="log" aria-label="추천 대화" aria-live="polite">
        {messages.length === 0 && <p className="assistant-welcome">“강아지 간식 2만원 이하”처럼 동물, 종류, 예산을 알려주세요.<br />펫시터는 지역과 서비스를 함께 입력하면 더 정확하게 찾을 수 있어요.</p>}
        {messages.map(({ id, question, reply }, index) => <section className="assistant-turn" key={id} ref={index === messages.length - 1 ? latestRef : null}>
          <h2 className="assistant-question">{question}</h2>
          <div className="assistant-answer"><strong>펫토피아 도우미</strong><p>{reply.message}</p>{reply.conditions && <p className="assistant-conditions">검색 조건: {reply.conditions}</p>}
            {reply.products?.length > 0 && <div className="assistant-products">{reply.products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} showDiscount categoryName={mockCategories.find((category) => category.id === product.categoryId)?.name} ratingSummary={getProductRating(productReviews, product.id)} />)}</div>}
            {reply.products?.length > 4 && <details><summary>추천 상품 {reply.products.length - 4}개 더 보기</summary><div className="assistant-products">{reply.products.slice(4).map((product) => <ProductCard key={product.id} product={product} showDiscount ratingSummary={getProductRating(productReviews, product.id)} />)}</div></details>}
            {reply.sitters?.length > 0 && <div className="assistant-sitters">{reply.sitters.map((sitter) => <Link key={sitter.id} to={'/sitters/' + sitter.id}><strong>{sitter.name} ↗</strong><span>{mockRegions.find((region) => region.id === sitter.regionId)?.name}</span><span>{sitter.services.map((service) => `${mockServices.find((item) => item.id === service.serviceId)?.name} ${formatWon(service.price)}`).join(' · ')}</span></Link>)}</div>}
            {reply.faqs?.map((faq) => <div className="assistant-faq" key={faq.id}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}
            {(reply.type === 'faq' || reply.type === 'fallback') && <Link to="/faq">자주 묻는 문의 보기 →</Link>}
          </div>
        </section>)}
      </div>
      <form className="assistant-form" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
        <label htmlFor={questionId}>궁금한 내용을 입력하세요</label><div><input id={questionId} value={input} maxLength={300} onChange={(event) => setInput(event.target.value)} placeholder="예: 강남에서 강아지 산책해 줄 펫시터" /><button type="submit" disabled={!input.trim()}>보내기</button></div>
      </form>
      {messages.length > 0 && <button className="assistant-reset" type="button" onClick={() => setMessages([])}>대화 새로 시작</button>}
    </div>
  );
}

export { AssistantPage };
