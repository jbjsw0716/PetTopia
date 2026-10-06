import { useEffect, useRef } from 'react';
import { HeaderIcon } from './HeaderIcon.jsx';
import './HeaderSearch.css';

function HeaderSearch({ searchInput, popularKeywords, onSearchInputChange, onSearchSubmit, onPopularKeywordSelect, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    inputRef.current.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const keyword = searchInput.trim();
    if (!keyword) {
      inputRef.current.focus();
      return;
    }
    onSearchSubmit(keyword);
    onClose();
  }

  return (
    <dialog ref={dialogRef} id="site-header-search" className="header-search-dialog" aria-labelledby="header-search-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="header-search-panel">
        <div className="header-search-content">
          <h2 id="header-search-title">SEARCH</h2>
          {/* 이름표는 화면에 보인다 — placeholder 만으로 설명하지 않는다.
              둥근 입력 상자 안이 아니라 위에 둔다 */}
          <label className="header-search-label" htmlFor="header-search-input">상품 검색</label>
          <form className="header-search-form" onSubmit={handleSubmit} role="search">
            <input id="header-search-input" ref={inputRef} type="search" autoComplete="off" placeholder="검색어를 입력해주세요." value={searchInput} onChange={(event) => onSearchInputChange(event.target.value)} />
            <button type="submit" aria-label="검색 실행" title="검색"><HeaderIcon name="search" /></button>
          </form>
          {popularKeywords.length > 0 && <div className="header-search-keywords"><h3>인기 검색어</h3><div>{popularKeywords.map((keyword) => <button type="button" key={keyword} onClick={() => { onPopularKeywordSelect(keyword); onClose(); }}>#{keyword}</button>)}</div></div>}
        </div>
        <button type="button" className="header-search-close" onClick={onClose} aria-label="검색 닫기" title="닫기"><HeaderIcon name="close" /></button>
      </div>
    </dialog>
  );
}

export { HeaderSearch };
