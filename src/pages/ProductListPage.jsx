import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { FilterPanel } from '../components/FilterPanel.jsx';
import { InfiniteList } from '../components/InfiniteList.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { mockCategories } from '../mocks/mockCategories.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { CHUNK_SIZE, PET_TYPE_LABELS } from '../utils/constants.js';
import { getProductRating } from '../utils/productRating.js';
import { PRODUCT_SORT_OPTIONS as SORT_OPTIONS, sortProducts } from '../utils/productSort.js';
import './ProductListPage.css';

// S-01 상품 목록 — F-01 조회 · F-02 검색 · F-03 2축 필터 · F-34 정렬 · F-46 무한 스크롤.
//
// F-36 탐색 순서는 검색어 → 2축 필터 → 정렬 → 묶음 이다.
// 조건이 하나라도 바뀌면 목록을 처음부터 다시 불러온다.

const PET_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'DOG', label: PET_TYPE_LABELS.DOG },
  { value: 'CAT', label: PET_TYPE_LABELS.CAT }
];


// 한쪽 동물에만 있는 분류는 반대쪽 메뉴에 내보내지 않는다.
// 분류의 petTypes 는 메뉴 노출만 정하고 필터 판정에는 쓰지 않는다.
function getMenuCategories(petType) {
  if (petType === 'all') {
    return mockCategories;
  }
  return mockCategories.filter((category) => category.petTypes.includes(petType));
}

function getCategoryName(categoryId) {
  const category = mockCategories.find((item) => item.id === categoryId);
  return category ? category.name : '';
}

// F-02 — 검색어가 상품명 · 용품 분류 이름 · 적용 동물 이름 중에 들어 있으면 찾는다.
// `사료` · `간식` · `위생용품` 처럼 분류 이름으로 찾는 것이 자연스러운데 상품명에 그 낱말이 없는
// 상품이 많다 (`위생용품` 은 상품명에 한 번도 나오지 않는다).
// 공백으로 나눈 낱말이 모두 들어 있어야 한다 — `강아지 간식` 이 강아지의 간식만 찾는다.
// 앞뒤 공백 제거는 검색어를 확정하는 쪽이 이미 했다.
function matchesSearch(product, keyword) {
  if (keyword === '') {
    return true;
  }
  const searchable = [
    product.name,
    getCategoryName(product.categoryId),
    ...product.petTypes.map((petType) => PET_TYPE_LABELS[petType])
  ]
    .join(' ')
    .toLowerCase();
  return keyword
    .toLowerCase()
    .split(/\s+/)
    .every((word) => searchable.includes(word));
}

// F-03 2축 필터 — 적용 동물과 용품 분류를 AND 로 결합한다.
// 적용 동물은 배열 포함 여부로 판정하므로 공용 상품(['DOG','CAT'])은 양쪽에서 걸린다.
function matchesFilter(product, petType, categoryId) {
  const matchesPetType = petType === 'all' || product.petTypes.includes(petType);
  const matchesCategory = categoryId === 'all' || product.categoryId === categoryId;
  return matchesPetType && matchesCategory;
}

function ProductListPage() {
  const {
    appliedSearch,
    appliedPetType,
    appliedCategoryId,
    applySearch,
    setAppliedPetType,
    setAppliedCategoryId,
    setListComplete,
    wishlistProductIds,
    toggleWishlist,
    storageStatus,
    mockDataStatus,
    allProductReviews
  } = useOutletContext();

  const [isFilterOpen, setFilterOpen] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [sortType, setSortType] = useState('default');
  // 실패한 상품 id 를 함께 둔다 — 안내를 누른 카드에 붙이기 위해서다
  const [wishError, setWishError] = useState(null);

  function handleWishToggle(productId) {
    const result = toggleWishlist(productId);
    setWishError(result.ok ? null : { productId, message: result.message });
  }

  const menuCategories = getMenuCategories(appliedPetType);
  // 고른 분류가 지금 동물의 메뉴에 없으면 전체보기로 본다.
  // 적용 동물과 용품 분류 둘 다 헤더에서도 바뀌므로 고른 값을 그대로 쓰지 않고 여기서
  // 한 번 거른다. 이 판정은 상품 목록이 갖는다 — 공유 상태는 고른 값을 그대로 들고 있는다.
  const isCategoryInMenu = menuCategories.some(
    (item) => item.id === appliedCategoryId
  );
  const categoryValue = isCategoryInMenu ? appliedCategoryId : 'all';

  // 지금 걸린 조건. 표시 개수가 어느 조건에 딸린 것인지 가리는 데 쓴다.
  const conditionKey = [appliedSearch, appliedPetType, categoryValue, sortType].join('|');

  // 표시 개수를 조건과 한 쌍으로 들고 있는다. 조건이 달라지면 한 묶음으로 돌아가므로
  // 목록이 처음부터 다시 불러진다.
  // 검색어와 적용 동물은 헤더에서도 바뀌어 이 화면의 이벤트를 거치지 않는다. 한 쌍으로 두면
  // 어느 경로로 바뀌든 되돌리는 코드가 따로 필요 없다.
  const [loaded, setLoaded] = useState({ conditionKey, count: CHUNK_SIZE });
  const visibleCount = loaded.conditionKey === conditionKey ? loaded.count : CHUNK_SIZE;

  const matchedProducts = mockProducts.filter(
    (product) =>
      matchesSearch(product, appliedSearch) &&
      matchesFilter(product, appliedPetType, categoryValue)
  );
  // 평점순 정렬도 카드의 평점과 같은 리뷰 목록으로 계산한다
  const sortedProducts = sortProducts(matchedProducts, sortType, allProductReviews);
  // 자르는 것은 화면이다. InfiniteList 는 받은 것을 그린다
  const visibleProducts = sortedProducts.slice(0, visibleCount);
  const isComplete = visibleCount >= sortedProducts.length;

  // 다 불러왔는지를 Layout 에 알린다. 무한 스크롤 화면의 푸터가 여기에 묶여 있다.
  // 0건도 더 불러올 것이 없는 상태라 true 다.
  useEffect(() => {
    setListComplete(isComplete);
  }, [isComplete, setListComplete]);

  // 이 화면을 떠나면 푸터를 다시 보이게 되돌린다. 그러지 않으면 다른 화면에서도 푸터가
  // 보이지 않는다.
  useEffect(() => {
    return () => setListComplete(true);
  }, [setListComplete]);

  function handleLoadMore() {
    setLoaded({ conditionKey, count: visibleCount + CHUNK_SIZE });
  }

  // 골라 둔 적용 동물·용품 분류는 그대로 두고 그 안에서 찾는다.
  // 헤더 검색은 어느 화면에서든 실행되는 검색이라 Layout 이 필터를 전체로 되돌리고 찾는다.
  function handleSearchSubmit(event) {
    event.preventDefault();
    const keyword = new FormData(event.currentTarget).get('keyword').trim();
    if (keyword === '') {
      return;
    }
    applySearch(keyword);
  }

  // F-36 검색어·필터·정렬을 모두 기본값으로 되돌린다.
  // 적용 동물·용품 분류는 공유 상태라 헤더도 함께 되돌아간다.
  function handleReset() {
    applySearch('');
    setLocalSearch('');
    setAppliedPetType('all');
    setAppliedCategoryId('all');
    setSortType('default');
  }

  const conditionText = [
    appliedSearch === '' ? '검색어 없음' : '검색어 ' + appliedSearch,
    appliedPetType === 'all' ? '적용 동물 전체' : PET_TYPE_LABELS[appliedPetType],
    categoryValue === 'all' ? '분류 전체' : getCategoryName(categoryValue)
  ].join(' · ');

  let listArea;
  if (mockProducts.length === 0) {
    // 등록 상품 없음 — 조건 결과 없음과 다른 문구다
    listArea = <EmptyState message="등록된 상품이 없습니다." />;
  } else if (sortedProducts.length === 0) {
    listArea = (
      <EmptyState
        message="조건에 맞는 상품이 없습니다."
        actionLabel="조건 초기화"
        onAction={handleReset}
      />
    );
  } else {
    listArea = (
      <InfiniteList
        completeMessage="모든 상품을 확인하셨습니다."
        isComplete={isComplete}
        /* mock 은 모듈 import 라 불러오는 데 걸리는 시간이 없다 — 기다리는 구간이 생기지 않는다.
          같은 묶음을 두 번 불러오는 것은 표시 개수를 조건과 한 쌍으로 저장해 막는다 */
        isLoadingMore={false}
        onLoadMore={handleLoadMore}
      >
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={getCategoryName(product.categoryId)}
            showWish={true}
            isWished={wishlistProductIds.includes(product.id)}
            wishDisabled={storageStatus !== 'ready'}
            onWishToggle={handleWishToggle}
            showDiscount={true}
            ratingSummary={getProductRating(allProductReviews, product.id)}
            wishErrorMessage={
              wishError && wishError.productId === product.id ? wishError.message : ''
            }
          />
        ))}
      </InfiniteList>
    );
  }

  return (
    <div className="product-list">
      <div className="product-list-head">
        <h1>상품 목록</h1>
        <p className="product-list-condition">적용 조건: {conditionText}</p>
        <p className="product-list-count">조회 결과 {sortedProducts.length}건</p>
      </div>
      {/* 기초 데이터(mock)가 어긋나면 알리고, 담기·주문은 Layout 이 막는다 */}
      {mockDataStatus === 'error' && (
        <p className="product-list-mock-error" role="alert">
          기초 데이터에 오류가 있어 상품을 담거나 주문할 수 없습니다.
        </p>
      )}

      <div className="product-list-body">
        <div className="product-list-main">{listArea}</div>

        <aside className="product-filter-sidebar">
          <button type="button" className="product-filter-toggle" aria-expanded={isFilterOpen} aria-controls="product-filter-content" onClick={() => setFilterOpen(!isFilterOpen)}>상품 검색 및 필터 <span>{isFilterOpen ? '− 최소화' : '+ 확장'}</span></button>
          <div id="product-filter-content" hidden={!isFilterOpen}>
        <form
          className="product-list-search"
          onSubmit={handleSearchSubmit}
        >
          {/* placeholder 로 대신하지 않고 보이는 label 을 둔다 */}
          <label className="product-list-search-label" htmlFor="product-search">
            상품 검색
          </label>
          <div className="product-list-search-row">
            <input
              id="product-search"
              className="product-list-search-input"
              type="text"
              name="keyword"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
            />
            <button type="submit" className="product-list-search-button">
              검색
            </button>
          </div>
          {/* 필터가 골라져 있으면 그 안에서 찾는다는 것을 알린다. 안내가 없으면 0건이 나왔을 때
              검색이 안 되는 것으로 보인다 (예: 위생용품에서 사료 검색) */}
          {appliedPetType !== 'all' || categoryValue !== 'all' ? (
            <p className="product-list-search-note">
              선택한 적용 동물·용품 분류 안에서 검색해요.
            </p>
          ) : null}
          {appliedSearch !== '' ? (
            <button
              type="button"
              className="product-list-search-clear"
              onClick={() => { setLocalSearch(''); applySearch(''); }}
            >
              검색어 지우기
            </button>
          ) : null}
        </form>

        <FilterPanel title="검색 필터" onReset={handleReset}>
          <fieldset className="product-list-filter">
            <legend className="product-list-filter-title">적용 동물</legend>
            {PET_TYPE_OPTIONS.map((option) => (
              <label className="product-list-filter-option" key={option.value}>
                <input
                  type="radio"
                  name="petType"
                  value={option.value}
                  checked={appliedPetType === option.value}
                  onChange={() => setAppliedPetType(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          {/* 헤더 하위 메뉴와 이 라디오가 같은 값 하나를 본다.
              두 군데에 보이지만 값은 하나라 한쪽에서 고르면 다른 쪽이 따라온다 */}
          <fieldset className="product-list-filter">
            <legend className="product-list-filter-title">용품 분류</legend>
            <label className="product-list-filter-option">
              <input
                type="radio"
                name="category"
                value="all"
                checked={categoryValue === 'all'}
                onChange={() => setAppliedCategoryId('all')}
              />
              전체보기
            </label>
            {menuCategories.map((category) => (
              <label className="product-list-filter-option" key={category.id}>
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={categoryValue === category.id}
                  onChange={() => setAppliedCategoryId(category.id)}
                />
                {category.name}
              </label>
            ))}
          </fieldset>

          <div className="product-list-filter">
            <label className="product-list-filter-title" htmlFor="product-sort">
              정렬
            </label>
            <select
              id="product-sort"
              className="product-list-sort"
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
        </FilterPanel>
          </div>
        </aside>
      </div>


    </div>
  );
}

export { ProductListPage };
