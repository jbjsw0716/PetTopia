import './StatusBadge.css';

// type 이 필요한 이유: 같은 COMPLETED 라도 주문이면 '주문 완료', 예약이면 '예약 완료' 다.
// 문구 대응표를 이 컴포넌트 안에만 둔다. 화면마다 다시 쓰지 않는다.
const STATUS_LABELS = {
  order: {
    COMPLETED: '주문 완료',
    CANCELLED: '취소'
  },
  reservation: {
    COMPLETED: '예약 완료',
    CANCELLED: '취소'
  },
  inquiry: {
    RECEIVED: '접수',
    ANSWERED: '답변 완료'
  }
};

function StatusBadge({ status = '', type = 'order' }) {
  const labels = STATUS_LABELS[type];
  const label = labels ? labels[status] : undefined;

  // 대응표에 없는 값은 지어내지 않고 받은 값을 그대로 보인다.
  // 값이 어긋난 것을 화면에서 바로 알아볼 수 있어야 한다.
  const className =
    'status-badge status-badge-' + (label ? status.toLowerCase() : 'unknown');

  return <span className={className}>{label ? label : status}</span>;
}

export { StatusBadge };
