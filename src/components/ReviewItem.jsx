import { Link } from 'react-router-dom';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatDateTime } from '../utils/datetime.js';
import './ReviewItem.css';

// 후기 한 건 (펫시터 상세 · 이용 후기). 두 화면이 같은 모양으로 보여야 해서 하나로 둔다.
// 펫시터명·서비스명은 화면이 찾아서 넘긴다 — 카드가 mock 을 직접 읽지 않는다 (SitterCard 와 같은 방식).
// showSitterLink 는 이용 후기에서만 켠다. 펫시터 상세는 이미 그 펫시터의 화면이다.
// 링크가 꺼져 있어도 sitterName 이 있으면 글자로 보인다 — 펫시터를 찾지 못한 후기가
// 이름 자리를 비운 채 나오지 않게 한다.
function ReviewItem({
  review,
  sitterName = '',
  serviceName = '',
  showSitterLink = false
}) {
  return (
    <li className="review-item">
      <p className="review-item-head">
        <span className="review-item-rating">평점 {review.rating}</span>
        {showSitterLink ? (
          <Link className="review-item-sitter" to={'/sitters/' + review.sitterId}>
            {sitterName}
          </Link>
        ) : sitterName ? (
          <span>{sitterName}</span>
        ) : null}
        <span>{serviceName}</span>
        <span>{PET_TYPE_LABELS[review.petType]}</span>
        <span className="review-item-date">
          {formatDateTime(review.writtenAt).slice(0, 10)}
        </span>
      </p>
      <p className="review-item-content">{review.content}</p>
    </li>
  );
}

export { ReviewItem };
