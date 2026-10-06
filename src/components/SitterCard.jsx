import { Link } from 'react-router-dom';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatWon } from '../utils/money.js';
import './SitterCard.css';

// 이벤트가 없고 이동만 한다.
//
// 카드가 평점을 계산하지 않는다. 화면이 utils/rating.js 로 계산해 문자열로 넘긴다 —
// 후기가 0건이면 '평점 없음' 이다.
//
// regionName·serviceNames 도 화면이 찾아 넘긴다. 카드가 mockRegions·mockServices 를
// 직접 가져오면 목록 화면이 이미 가진 데이터를 두 번 읽는다.
function SitterCard({
  sitter,
  regionName = '',
  serviceNames = [],
  lowestPrice = 0,
  ratingText = '',
  isExcellent = false
}) {
  return (
    <article className="sitter-card">
      <Link className="sitter-card-body" to={'/sitters/' + sitter.id}>
        {sitter.imageUrl ? (
          <img
            className="sitter-card-image"
            src={sitter.imageUrl}
            alt={sitter.name}
          />
        ) : (
          <div className="sitter-card-image sitter-card-image-empty" />
        )}

        <div className="sitter-card-info">
          <h3 className="sitter-card-name">{sitter.name}</h3>
          {isExcellent && <span className="sitter-excellent" title="평균 평점 4.5점 이상"><span aria-hidden="true">👍</span> 우수 펫시터</span>}
          <p className="sitter-card-region">{regionName}</p>

          <dl className="sitter-card-detail">
            <dt className="sitter-card-term">돌봄 가능 동물</dt>
            <dd className="sitter-card-desc">
              {sitter.petTypes.map((petType) => PET_TYPE_LABELS[petType]).join(' · ')}
            </dd>

            <dt className="sitter-card-term">제공 서비스</dt>
            <dd className="sitter-card-desc">{serviceNames.join(' · ')}</dd>

            <dt className="sitter-card-term">대표 요금</dt>
            <dd className="sitter-card-desc">{formatWon(lowestPrice)}부터</dd>

            <dt className="sitter-card-term">평점</dt>
            <dd className="sitter-card-desc">{ratingText}</dd>
          </dl>
        </div>
      </Link>
    </article>
  );
}

export { SitterCard };
