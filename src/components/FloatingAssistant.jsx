import { useRef, useState } from 'react';
import { AssistantPage } from '../pages/AssistantPage.jsx';
import './FloatingAssistant.css';

// 모든 화면 오른쪽 아래에 떠 있는 추천 도우미 — Layout 전용 조각이다.
// 기능 이름은 '대화형 검색'(R-22·F-44·S-25), 화면에 보이는 이름은 '추천 도우미'다.
// 닫기 버튼도 화면 이름으로 읽힌다 — '챗봇' 은 규칙 기반 구현과 맞지 않아 기각한 말이다.
// <Outlet> 밖에 그려져 useOutletContext 로 값을 받을 수 없다. 상품 카드 평점에 쓸
// 리뷰 목록(allProductReviews)은 Layout 이 props 로 직접 넘긴다.
function FloatingAssistant({ allProductReviews = [] }) {
  const [isOpen, setOpen] = useState(false);
  const trigger = useRef(null);

  function handleClose() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <aside className="floating-assistant" onKeyDown={(event) => { if (event.key === 'Escape') handleClose(); }}>
      <section id="floating-chat" className="floating-chat" aria-label="추천 도우미" hidden={!isOpen}>
        <div className="floating-chat-bar"><strong>펫토피아 추천 도우미</strong><button type="button" onClick={handleClose} aria-label="추천 도우미 닫기">✕</button></div>
        <AssistantPage allProductReviews={allProductReviews} />
      </section>
      <button type="button" ref={trigger} className="chat-launcher" aria-expanded={isOpen} aria-controls="floating-chat" onClick={() => setOpen(!isOpen)}>♡ {isOpen ? '닫기' : '추천 도우미'}</button>
    </aside>
  );
}

export { FloatingAssistant };
