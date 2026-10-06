import './ConfirmArea.css';

// 펼침 여부는 화면의 상태다. 컴포넌트가 갖지 않는다.
// onCancel 은 확인만 닫는다. 화면을 이동하지 않는다.
function ConfirmArea({
  isOpen = false,
  message = '',
  confirmLabel = '확인',
  isSubmitting = false,
  onConfirm = () => {},
  onCancel = () => {}
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-area">
      <p className="confirm-area-message">{message}</p>
      <div className="confirm-area-buttons">
        <button
          type="button"
          className="confirm-area-cancel"
          onClick={onCancel}
        >
          돌아가기
        </button>
        {/* 처리 중에는 확인 버튼을 비활성화한다 — 중복 제출 방지다 */}
        <button
          type="button"
          className="confirm-area-confirm"
          disabled={isSubmitting}
          onClick={onConfirm}
        >
          {isSubmitting ? '처리 중' : confirmLabel}
        </button>
      </div>
    </div>
  );
}

export { ConfirmArea };
