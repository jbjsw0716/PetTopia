import { Link, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { ReviewItem } from '../components/ReviewItem.jsx';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockReviews } from '../mocks/mockReviews.js';
import { mockServices } from '../mocks/mockServices.js';
import { mockSitters } from '../mocks/mockSitters.js';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatWon } from '../utils/money.js';
import { formatRating, getRatingSummary } from '../utils/rating.js';
import { formatAvailableHours } from '../utils/schedule.js';
import './SitterDetailPage.css';

// S-08 펫시터 상세 — F-18 상세 조회 · F-19 예약서 확인으로 가는 진입점 · F-24 그 펫시터의 후기.
// 대상은 URL 의 :sitterId 에 담겨 있어 새로고침·직접 접근에서도 그대로 보인다.
//
// 이용 가능 시간은 요일별 mock 값이다. 특정 날짜에 고정하지 않으며 실시간 예약 현황을 연동하지 않는다.
//
// 예약하기(예약서로 이동)는 제공하는 서비스가 있을 때만 내보낸다. 서비스가 없는 펫시터에게
// 예약을 시작할 수 없는 화면(예약서)으로 보내지 않고, 여기서 이유를 바로 알려준다.

function SitterDetailPage() {
  const { sitterId } = useParams();
  const { reviews: storedReviews } = useOutletContext();

  const sitter = mockSitters.find((item) => item.id === sitterId);

  if (!sitter) {
    return (
      <div className="sitter-detail">
        <EmptyState
          message="요청한 펫시터를 찾을 수 없습니다."
          actionLabel="펫시터 찾기로 가기"
          actionTo="/sitters"
        />
      </div>
    );
  }

  const region = mockRegions.find((item) => item.id === sitter.regionId);

  const sitterReviews = [...mockReviews, ...storedReviews]
    .filter((review) => review.sitterId === sitter.id)
    .sort((a, b) => new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime());
  const rating = getRatingSummary(sitterReviews, sitter.id);

  return (
    <div className="sitter-detail">
      <Link className="sitter-detail-back" to="/sitters">
        ← 목록으로
      </Link>

      <section className="sitter-detail-profile">
        {sitter.imageUrl ? (
          <img
            className="sitter-detail-photo"
            src={sitter.imageUrl}
            alt={sitter.name + ' 프로필 사진'}
          />
        ) : (
          <div className="sitter-detail-photo" />
        )}
        <div className="sitter-detail-info">
          <h1 className="sitter-detail-name">{sitter.name}</h1>
          {/* 후기가 없으면 `평점 없음` 한 마디만 쓴다 — `평점 평점 없음` 이 되지 않게 한다 */}
          <p className="sitter-detail-rating">
            {rating.average === null
              ? formatRating(rating.average)
              : '평점 ' + formatRating(rating.average) + ' · 후기 ' + rating.count + '건'}
          </p>
          <dl className="sitter-detail-facts">
            <dt>활동 지역</dt>
            <dd>{region ? region.name : ''}</dd>
            <dt>돌봄 가능 동물</dt>
            <dd>{sitter.petTypes.map((petType) => PET_TYPE_LABELS[petType]).join(' · ')}</dd>
            <dt>경력</dt>
            <dd>{sitter.career}</dd>
          </dl>

          {sitter.services.length === 0 ? (
            <p className="sitter-detail-book-empty">제공하는 서비스가 없어 예약할 수 없습니다.</p>
          ) : (
            <Link className="sitter-detail-book" to={'/sitters/' + sitter.id + '/reservation'}>
              예약하기
            </Link>
          )}
        </div>
      </section>

      <section className="sitter-detail-section">
        <h2 className="sitter-detail-section-title">서비스별 요금</h2>
        {sitter.services.length === 0 ? (
          <p className="sitter-detail-empty">제공하는 서비스가 없습니다.</p>
        ) : (
          <ul className="sitter-detail-list">
            {sitter.services.map((item) => {
              const service = mockServices.find((entry) => entry.id === item.serviceId);

              return (
                <li className="sitter-detail-row" key={item.serviceId}>
                  <span>{service ? service.name : item.serviceId}</span>
                  <span className="sitter-detail-price">
                    {formatWon(item.price)} / {service ? service.unitLabel : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="sitter-detail-section">
        <h2 className="sitter-detail-section-title">요일별 이용 가능 시간</h2>
        <ul className="sitter-detail-list">
          {formatAvailableHours(sitter.availableHours).map((group) => (
            <li className="sitter-detail-row" key={group.label}>
              <span>{group.label}</span>
              <span className="sitter-detail-price">{group.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sitter-detail-section">
        <h2 className="sitter-detail-section-title">이 펫시터의 이용 후기</h2>
        {sitterReviews.length === 0 ? (
          <p className="sitter-detail-empty">아직 등록된 후기가 없습니다.</p>
        ) : (
          <ul className="sitter-detail-reviews">
            {sitterReviews.map((review) => {
              const service = mockServices.find((entry) => entry.id === review.serviceId);

              return (
                <ReviewItem
                  key={review.id}
                  review={review}
                  serviceName={service ? service.name : ''}
                />
              );
            })}
          </ul>
        )}
        <Link className="sitter-detail-more" to="/reviews">
          이용 후기 전체 보기
        </Link>
      </section>
    </div>
  );
}

export { SitterDetailPage };
