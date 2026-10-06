import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { FilterPanel } from '../components/FilterPanel.jsx';
import { InfiniteList } from '../components/InfiniteList.jsx';
import { SitterCard } from '../components/SitterCard.jsx';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockReviews } from '../mocks/mockReviews.js';
import { mockServices } from '../mocks/mockServices.js';
import { mockSitters } from '../mocks/mockSitters.js';
import { CHUNK_SIZE, PET_TYPE_LABELS } from '../utils/constants.js';
import { getLowestServicePrice } from '../utils/money.js';
import { formatRating, getRatingSummary, isExcellentSitter } from '../utils/rating.js';
import { SITTER_SORT_OPTIONS, sortSitters } from '../utils/sitterSort.js';
import './SitterListPage.css';

// S-07 펫시터 찾기 — F-16 조회 · F-17 이름 검색·조건 필터 · F-46 무한 스크롤(한 묶음 12명).
//
// 네 조건(이름·지역·돌봄 가능 동물·제공 서비스)을 AND 로 결합한다. 조건이 바뀌면 처음부터 다시 불러온다.
// 평점은 그 펫시터 후기의 평균이다 — mock 초기 후기와 저장된 후기를 합쳐 계산한다.

const PET_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'DOG', label: PET_TYPE_LABELS.DOG },
  { value: 'CAT', label: PET_TYPE_LABELS.CAT }
];

function getRegionName(regionId) {
  const region = mockRegions.find((item) => item.id === regionId);
  return region ? region.name : '';
}

function getServiceName(serviceId) {
  const service = mockServices.find((item) => item.id === serviceId);
  return service ? service.name : '';
}

// 그 서비스가 이 동물을 돌볼 수 있는가 — 산책·데이케어는 강아지만이다 (mockServices petTypes)
function isServiceForPet(serviceId, petType) {
  const service = mockServices.find((item) => item.id === serviceId);
  return service ? service.petTypes.includes(petType) : false;
}

function matchesConditions(sitter, name, regionId, petType, serviceId) {
  const matchesName = name === '' || sitter.name.toLowerCase().includes(name.toLowerCase());
  const matchesRegion = regionId === 'all' || sitter.regionId === regionId;
  const matchesPetType = petType === 'all' || sitter.petTypes.includes(petType);
  // 서비스는 그 동물을 대상으로 하는 것만 센다. 추천 도우미(utils/assistant.js)와
  // 같은 판정이다 — '고양이 + 산책' 은 0명이고, '고양이' 만 고르면 고양이가 이용할 수 있는 서비스를
  // 하나 이상 제공하는 펫시터만 나온다
  const matchesService = sitter.services.some(
    (service) =>
      (serviceId === 'all' || service.serviceId === serviceId) &&
      (petType === 'all' || isServiceForPet(service.serviceId, petType))
  );

  return matchesName && matchesRegion && matchesPetType && matchesService;
}

function SitterListPage() {
  const { reviews: storedReviews, setListComplete } = useOutletContext();

  const [isFilterOpen, setFilterOpen] = useState(true);
  const [appliedName, setAppliedName] = useState('');
  const [regionId, setRegionId] = useState('all');
  const [petType, setPetType] = useState('all');
  const [serviceId, setServiceId] = useState('all');
  const [sortType, setSortType] = useState('default');

  // 표시 개수를 조건과 한 쌍으로 들고 있는다. 조건이 달라지면 한 묶음으로 돌아간다 (상품 목록과 같은 방식)
  const conditionKey = [appliedName, regionId, petType, serviceId, sortType].join('|');
  const [loaded, setLoaded] = useState({ conditionKey, count: CHUNK_SIZE });
  const visibleCount = loaded.conditionKey === conditionKey ? loaded.count : CHUNK_SIZE;

  const allReviews = [...mockReviews, ...storedReviews];
  const matchedSitters = sortSitters(mockSitters.filter((sitter) =>
    matchesConditions(sitter, appliedName, regionId, petType, serviceId)
  ), sortType, allReviews);
  const visibleSitters = matchedSitters.slice(0, visibleCount);
  const isComplete = visibleCount >= matchedSitters.length;

  // 다 불러왔는지를 Layout 에 알린다. 무한 스크롤 화면의 푸터가 여기에 묶여 있다
  useEffect(() => {
    setListComplete(isComplete);
  }, [isComplete, setListComplete]);

  // 이 화면을 떠나면 푸터를 다시 보이게 되돌린다
  useEffect(() => {
    return () => setListComplete(true);
  }, [setListComplete]);

  function handleLoadMore() {
    setLoaded({ conditionKey, count: visibleCount + CHUNK_SIZE });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const keyword = new FormData(event.currentTarget).get('keyword').trim();
    if (keyword === '') {
      return;
    }
    setAppliedName(keyword);
  }

  function handleReset() {
    setAppliedName('');
    setRegionId('all');
    setPetType('all');
    setServiceId('all');
    setSortType('default');
  }

  const conditionText = [
    appliedName === '' ? '이름 없음' : '이름 ' + appliedName,
    regionId === 'all' ? '지역 전체' : getRegionName(regionId),
    petType === 'all' ? '돌봄 동물 전체' : PET_TYPE_LABELS[petType],
    serviceId === 'all' ? '서비스 전체' : getServiceName(serviceId),
    SITTER_SORT_OPTIONS.find((option) => option.value === sortType).label
  ].join(' · ');

  let listArea;
  if (mockSitters.length === 0) {
    // 등록 펫시터 없음 — 조건 결과 없음과 다른 문구다
    listArea = <EmptyState message="등록된 펫시터가 없습니다." />;
  } else if (matchedSitters.length === 0) {
    listArea = (
      <EmptyState
        message="조건에 맞는 펫시터가 없습니다. 조건을 바꿔 보세요."
        actionLabel="조건 초기화"
        onAction={handleReset}
      />
    );
  } else {
    listArea = (
      <InfiniteList isComplete={isComplete} isLoadingMore={false} onLoadMore={handleLoadMore}>
        {visibleSitters.map((sitter) => (
          <SitterCard
            key={sitter.id}
            sitter={sitter}
            regionName={getRegionName(sitter.regionId)}
            serviceNames={sitter.services.map((service) => getServiceName(service.serviceId))}
            lowestPrice={getLowestServicePrice(sitter.services)}
            ratingText={formatRating(getRatingSummary(allReviews, sitter.id).average)}
            isExcellent={isExcellentSitter(getRatingSummary(allReviews, sitter.id).average)}
          />
        ))}
      </InfiniteList>
    );
  }

  return (
    <div className="sitter-list">
      <div className="sitter-list-head">
        <h1>펫시터 찾기</h1>
        <p className="sitter-list-condition">적용 조건: {conditionText}</p>
        <p className="sitter-list-count">조회 결과 {matchedSitters.length}명</p>
      </div>

      <div className="sitter-list-body">
        <div className="sitter-list-main">{listArea}</div>

        <aside className="sitter-filter-sidebar"><button type="button" className="sitter-filter-toggle" aria-expanded={isFilterOpen} aria-controls="sitter-filter-content" onClick={() => setFilterOpen(!isFilterOpen)}>펫시터 검색 및 필터 <span>{isFilterOpen ? '− 최소화' : '+ 확장'}</span></button><div id="sitter-filter-content" hidden={!isFilterOpen}>
        {/* 공통 헤더 검색바는 상품 검색 전용이라 펫시터 이름 검색은 따로 둔다 */}
        <form key={appliedName} className="sitter-list-search" onSubmit={handleSearchSubmit}>
          <label className="sitter-list-search-label" htmlFor="sitter-search">
            이름 검색
          </label>
          <input
            id="sitter-search"
            className="sitter-list-search-input"
            type="text"
            name="keyword"
            defaultValue={appliedName}
          />
          <button type="submit" className="sitter-list-search-button">
            검색
          </button>
          {appliedName !== '' ? (
            <button
              type="button"
              className="sitter-list-search-clear"
              onClick={() => setAppliedName('')}
            >
              검색어 지우기
            </button>
          ) : null}
        </form>
        <FilterPanel title="조건 필터" onReset={handleReset}>
          <fieldset className="sitter-list-filter">
            <legend className="sitter-list-filter-title">활동 지역</legend>
            <label className="sitter-list-filter-option">
              <input
                type="radio"
                name="region"
                value="all"
                checked={regionId === 'all'}
                onChange={() => setRegionId('all')}
              />
              전체
            </label>
            {mockRegions.map((region) => (
              <label className="sitter-list-filter-option" key={region.id}>
                <input
                  type="radio"
                  name="region"
                  value={region.id}
                  checked={regionId === region.id}
                  onChange={() => setRegionId(region.id)}
                />
                {region.name}
              </label>
            ))}
          </fieldset>

          <fieldset className="sitter-list-filter">
            <legend className="sitter-list-filter-title">돌봄 가능 동물</legend>
            {PET_TYPE_OPTIONS.map((option) => (
              <label className="sitter-list-filter-option" key={option.value}>
                <input
                  type="radio"
                  name="sitterPetType"
                  value={option.value}
                  checked={petType === option.value}
                  onChange={() => setPetType(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <fieldset className="sitter-list-filter">
            <legend className="sitter-list-filter-title">제공 서비스</legend>
            <label className="sitter-list-filter-option">
              <input
                type="radio"
                name="sitterService"
                value="all"
                checked={serviceId === 'all'}
                onChange={() => setServiceId('all')}
              />
              전체
            </label>
            {mockServices.map((service) => (
              <label className="sitter-list-filter-option" key={service.id}>
                <input
                  type="radio"
                  name="sitterService"
                  value={service.id}
                  checked={serviceId === service.id}
                  onChange={() => setServiceId(service.id)}
                />
                {service.name}
              </label>
            ))}
          </fieldset>
          <div className="sitter-list-sort">
            <label className="sitter-list-filter-title" htmlFor="sitter-sort">정렬</label>
            <select id="sitter-sort" value={sortType} onChange={(event) => setSortType(event.target.value)}>
              {SITTER_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {sortType === 'excellent' && <p>평점 4.5 이상 우선 · 같은 조건은 이름순</p>}
          </div>
        </FilterPanel>
        </div></aside>
      </div>


    </div>
  );
}

export { SitterListPage };
