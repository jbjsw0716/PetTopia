import './FilterPanel.css';

// 필터 항목을 props 로 받지 않고 children 으로 받는다. 두 화면의 축이 다르기 때문이다 —
// 상품 목록은 적용 동물·용품 분류·정렬, 펫시터 찾기는 지역·돌봄 가능 동물·제공 서비스·정렬이다.
// 하나의 props 목록으로 합치면 양쪽이 서로를 밀어낸다.
//
// 여기서는 세로 배치와 제목·초기화 자리만 제공한다.
// 조건이 바뀌면 목록을 처음부터 다시 불러오는 것은 화면의 책임이다.
function FilterPanel({ title = '', children, onReset = () => {} }) {
  return (
    <aside className="filter-panel">
      <div className="filter-panel-head">
        <h2 className="filter-panel-title">{title}</h2>
        <button type="button" className="filter-panel-reset" onClick={onReset}>
          초기화
        </button>
      </div>
      <div className="filter-panel-body">{children}</div>
    </aside>
  );
}

export { FilterPanel };
