import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { ReviewItem } from '../components/ReviewItem.jsx';
import { mockReviews } from '../mocks/mockReviews.js';
import { mockServices } from '../mocks/mockServices.js';
import { mockSitters } from '../mocks/mockSitters.js';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import './ReviewListPage.css';

// S-12 이용 후기 — F-24. mock 초기 후기와 저장된 후기를 합쳐 동물·서비스로 거르고 정렬한다.
//
// 저장 데이터를 읽지 못해도 mock 초기 후기는 보인다. 내가 쓴 후기만 빠졌다는 것을 함께 알린다.
// 한 페이지에 다 보이는 목록이다 — 무한 스크롤도 페이지네이션도 아니다.

const PET_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'DOG', label: PET_TYPE_LABELS.DOG },
  { value: 'CAT', label: PET_TYPE_LABELS.CAT }
];

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'ratingDesc', label: '평점 높은순' },
  { value: 'ratingAsc', label: '평점 낮은순' }
];

function byLatest(a, b) {
  return new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime();
}

// 정렬은 복사본에 적용한다. 같은 평점이면 최신순을 뒤 기준으로 쓴다.
function sortReviews(reviews, sortType) {
  const sorted = [...reviews];

  if (sortType === 'ratingDesc') {
    sorted.sort((a, b) => b.rating - a.rating || byLatest(a, b));
  } else if (sortType === 'ratingAsc') {
    sorted.sort((a, b) => a.rating - b.rating || byLatest(a, b));
  } else {
    sorted.sort(byLatest);
  }

  return sorted;
}

function ReviewListPage() {
  const { reviews: storedReviews, storageStatus } = useOutletContext();

  const [petType, setPetType] = useState('all');
  const [serviceId, setServiceId] = useState('all');
  const [sortType, setSortType] = useState('latest');

  const allReviews = [...mockReviews, ...storedReviews];
  const matchedReviews = allReviews.filter(
    (review) =>
      (petType === 'all' || review.petType === petType) &&
      (serviceId === 'all' || review.serviceId === serviceId)
  );
  const sortedReviews = sortReviews(matchedReviews, sortType);

  function handleReset() {
    setPetType('all');
    setServiceId('all');
    setSortType('latest');
  }

  let listArea;
  if (allReviews.length === 0) {
    // 후기 없음 — 조건 결과 없음과 다른 문구다
    listArea = <EmptyState message="등록된 후기가 없습니다." />;
  } else if (sortedReviews.length === 0) {
    listArea = (
      <EmptyState
        message="조건에 맞는 후기가 없습니다. 조건을 바꿔 보세요."
        actionLabel="조건 초기화"
        onAction={handleReset}
      />
    );
  } else {
    listArea = (
      <ul className="review-list-items">
        {sortedReviews.map((review) => {
          const sitter = mockSitters.find((item) => item.id === review.sitterId);
          const service = mockServices.find((item) => item.id === review.serviceId);

          return (
            <ReviewItem
              key={review.id}
              review={review}
              sitterName={sitter ? sitter.name : '알 수 없는 펫시터'}
              serviceName={service ? service.name : ''}
              showSitterLink={Boolean(sitter)}
            />
          );
        })}
      </ul>
    );
  }

  return (
    <div className="review-list">
      <div className="review-list-head">
        <h1>이용 후기</h1>
        <p className="review-list-count">
          전체 {allReviews.length}건 · 조회 결과 {sortedReviews.length}건
        </p>
      </div>

      {storageStatus === 'error' ? (
        <p className="review-list-storage-error" role="alert">
          저장 데이터를 불러오지 못해 내가 쓴 후기는 표시되지 않습니다.
        </p>
      ) : null}

      <div className="review-list-filters">
        <div className="review-list-filter">
          <label className="review-list-filter-label" htmlFor="review-pet-type">
            돌봄 동물
          </label>
          <select
            id="review-pet-type"
            className="review-list-select"
            value={petType}
            onChange={(event) => setPetType(event.target.value)}
          >
            {PET_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="review-list-filter">
          <label className="review-list-filter-label" htmlFor="review-service">
            서비스
          </label>
          <select
            id="review-service"
            className="review-list-select"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="all">전체</option>
            {mockServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="review-list-filter">
          <label className="review-list-filter-label" htmlFor="review-sort">
            정렬
          </label>
          <select
            id="review-sort"
            className="review-list-select"
            value={sortType}
            onChange={(event) => setSortType(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {listArea}
    </div>
  );
}

export { ReviewListPage };
