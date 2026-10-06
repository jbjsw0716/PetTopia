import './ScrollButtons.css';

// props 도 이벤트도 없다. 맨 아래로 가는 버튼은 뺐다 — 파일 이름은 그대로 둔다.
//
// 화면 안 이동일 뿐이다. 목록 상태를 바꾸지 않는다 — visibleCount 를 건드리지 않는다.
function ScrollButtons() {
  function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="scroll-buttons">
      <button
        type="button"
        className="scroll-buttons-item"
        aria-label="맨 위로"
        onClick={handleScrollToTop}
      >
        ↑
      </button>
    </div>
  );
}

export { ScrollButtons };
