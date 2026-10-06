import { Link } from 'react-router-dom';
import './EmptyState.css';

// 상황 문구와 다음 동작을 함께 보여준다. actionTo 가 있으면 Link, 없으면 onAction 을 쓴다.
function EmptyState({
  message = '',
  actionLabel = null,
  actionTo = null,
  onAction = () => {}
}) {
  return (
    <div className="empty-state">
      <p className="empty-state-message">{message}</p>

      {actionLabel ? (
        actionTo ? (
          <Link className="empty-state-action" to={actionTo}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" className="empty-state-action" onClick={onAction}>
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  );
}

export { EmptyState };
