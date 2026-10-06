import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FREE_SHIPPING_MIN } from '../utils/constants.js';
import { formatWon } from '../utils/money.js';
import './PromotionPopup.css';

// 홈 첫 방문 팝업 — 홈 한 화면에서만 쓰는 조각이다.
//
// 저장소를 직접 읽고 쓰지 않는다. 띄울지는 Layout 이 정하고 홈은 그때만 이 조각을 그린다.
// 닫을 때는 '오늘 하루 보지 않기' 를 골랐는지만 onClose 로 올려 보낸다 — 저장은 Layout 의 몫이다.
// canHideToday 가 false 면(저장 데이터를 읽지 못함) 그 선택을 잠근다. 저장할 수 없기 때문이다.
function PromotionPopup({
  canHideToday = true,
  onClose = () => ({ ok: true, message: '' })
}) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const [isHideTodayChecked, setHideToday] = useState(false);
  const [closeError, setCloseError] = useState(null);

  // <dialog> 를 모달로 여는 것은 브라우저 기능이라 화면에 그려진 뒤에 부른다.
  // 첫 포커스는 닫기 버튼이 아니라 제목에 둔다. 열리자마자 닫기 버튼에 포커스가
  // 가면 되살린 포커스 외곽선이 홈에 들어올 때마다 ✕ 에 보인다. 제목은 외곽선 대상이 아니고,
  // 화면 읽기 도구는 팝업 제목부터 읽는다. Tab·Shift+Tab 으로 버튼·링크에 닿을 수 있다
  useEffect(() => {
    dialogRef.current?.showModal();
    titleRef.current?.focus();
  }, []);

  // 저장에 실패하면 닫지 않고 이유를 보인다. 링크였다면 이동도 멈춘다 —
  // 저장되지 않은 '오늘 하루 보지 않기' 를 된 것처럼 보이지 않는다
  function handleClose(event) {
    const result = onClose(isHideTodayChecked);
    if (!result.ok) {
      event.preventDefault();
      setCloseError(result.message);
      return;
    }
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="promotion-popup"
      aria-labelledby="promotion-popup-title"
      onCancel={(event) => {
        // Esc 로 닫을 때도 같은 길로 보낸다. 브라우저가 먼저 닫아 버리지 않게 막는다
        event.preventDefault();
        handleClose(event);
      }}
    >
      <button
        type="button"
        className="popup-close"
        onClick={handleClose}
        aria-label="프로모션 닫기"
      >
        ✕
      </button>
      <p className="eyebrow">A LITTLE GIFT FOR YOUR PET</p>
      <div className="popup-symbol" aria-hidden="true">↗</div>
      <h2 id="promotion-popup-title" ref={titleRef} tabIndex={-1}>
        함께 담으면,<br />배송비는 가볍게.
      </h2>
      <p>{formatWon(FREE_SHIPPING_MIN)} 이상 구매 시 무료배송</p>
      <Link className="arrow-button" to="/promotions" onClick={handleClose}>
        진행 중인 기획전 보기 ↗
      </Link>
      <label className="popup-today">
        <input
          type="checkbox"
          checked={isHideTodayChecked}
          disabled={!canHideToday}
          onChange={(event) => setHideToday(event.target.checked)}
        />{' '}
        오늘 하루 보지 않기
      </label>
      {closeError ? (
        <p className="popup-error" role="alert">
          {closeError}
        </p>
      ) : null}
    </dialog>
  );
}

export { PromotionPopup };
