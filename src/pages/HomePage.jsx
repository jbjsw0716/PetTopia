import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { ProductCarousel } from '../components/ProductCarousel.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { PromotionPopup } from '../components/PromotionPopup.jsx';
import { mockCategories } from '../mocks/mockCategories.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { SitterCard } from '../components/SitterCard.jsx';
import { mockSitters } from '../mocks/mockSitters.js';
import { mockReviews } from '../mocks/mockReviews.js';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockServices } from '../mocks/mockServices.js';
import { getRatingSummary, formatRating, isExcellentSitter } from '../utils/rating.js';
import { getProductRating } from '../utils/productRating.js';
import { getLowestServicePrice } from '../utils/money.js';
import './HomePage.css';

const PET_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' }
];
// 배너 그림은 배경이 아니라 <img> 로 둔다 (HomePage.css `.home-banner-image`).
// 배경으로 깔면 좁은 화면에서 문구와 피사체가 겹쳐서, 1000px 아래에서는 문구 밑으로 사진을 내린다.
// 장식 그림이라 alt 는 빈 값이다 — 슬라이드 제목이 바로 옆에 글로 있다.
// 세 장을 모두 그려 두고 hidden 으로 하나만 보인다 — 넘길 때 새로 받지 않아 깜빡이지 않는다
// (HomePage.css `.home-banner-image[hidden]`).
const SLIDES = [
  { type: 'DOG', label: '강아지', image: '/images/배너1.png', title: '강아지의 하루에, 더 많은 즐거움을.', description: '맛있는 한 끼부터 신나는 산책까지, 우리 아이의 일상을 채워주세요.', action: '강아지 용품 보기' },
  { type: 'CAT', label: '고양이', image: '/images/배너2.png', title: '고양이의 취향을, 조금 더 특별하게.', description: '즐거운 사냥 놀이와 포근한 휴식, 고양이를 위한 작은 발견.', action: '고양이 용품 보기' },
  { type: 'SITTER', label: '펫시터', image: '/images/배너3.png', title: '곁에 없는 시간도, 따뜻한 돌봄으로.', description: '우리 아이에게 맞는 펫시터와 함께 편안한 하루를 준비하세요.', action: '펫시터 찾기' }
];
const CARE_BANNER_IMAGE = '/images/배너4.png';

function HomePage() {
  const navigate = useNavigate();
  const { applySearch, setAppliedPetType, setAppliedCategoryId, reviews: storedReviews, storageStatus, isPromotionPopupOpen, closePromotionPopup, allProductReviews } = useOutletContext();
  const [selectedPet, setSelectedPet] = useState('all');
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const slide = SLIDES[slideIndex];
  const topSitters = mockSitters.map((sitter) => ({ sitter, summary: getRatingSummary([...mockReviews, ...storedReviews], sitter.id) })).filter(({ summary }) => isExcellentSitter(summary.average)).sort((a, b) => b.summary.average - a.summary.average || b.summary.count - a.summary.count || a.sitter.id.localeCompare(b.sitter.id)).slice(0, 8);
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setSlideIndex((index) => (index + 1) % SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, [isPaused, slideIndex]);
  const featuredProducts = mockProducts
    .filter((product) => selectedPet === 'all' || product.petTypes.includes(selectedPet))
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 16);

  function openShop(petType = 'all', categoryId = 'all') {
    applySearch('');
    setAppliedPetType(petType);
    setAppliedCategoryId(categoryId);
    navigate('/products');
  }

  return (
    <div className="home">
      {/* 띄울지는 Layout 이 정한다 — 이번 접속에 닫았거나 '오늘 하루 보지 않기' 가 살아 있으면 그리지 않는다 */}
      {isPromotionPopupOpen && <PromotionPopup canHideToday={storageStatus === 'ready'} onClose={closePromotionPopup} />}
      <section className={`home-hero home-hero-${slide.type.toLowerCase()}`} aria-label="추천 슬라이드" aria-roledescription="carousel">
        {SLIDES.map((item, index) => <img key={item.type} className="home-banner-image" src={item.image} alt="" aria-hidden="true" hidden={index !== slideIndex} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" width="2172" height="724" />)}
        <div className="home-hero-copy">
          <p className="eyebrow">{slideIndex + 1} / PETTOPIA · {slide.label}</p>
          <h1>{slide.title}</h1>
          <p className="home-description">{slide.description}</p>
          <button type="button" className="arrow-button" onClick={() => slide.type === 'SITTER' ? navigate('/sitters') : openShop(slide.type)}>{slide.action} ↗</button>
          <div className="home-slide-controls">
            {SLIDES.map((item, index) => <button type="button" key={item.type} aria-label={`${item.label} 슬라이드`} aria-pressed={index === slideIndex} onClick={() => setSlideIndex(index)}>{index + 1}</button>)}
            <button type="button" onClick={() => setPaused(!isPaused)}><span aria-hidden="true">{isPaused ? '▶' : '■'}</span> {isPaused ? '재생' : '중지'}</button>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-categories-title">
        <div className="home-section-heading"><div><p className="eyebrow">SHOP BY CATEGORY</p><h2 id="home-categories-title">오늘은 무엇이 필요한가요?</h2></div></div>
        <div className="home-category-groups">
          {mockCategories.map((category) => (
            <section className="home-category-group" key={category.id}>
              <div className="home-category-heading"><h3>{category.name}</h3><button type="button" className="home-text-button" onClick={() => openShop('all', category.id)}>{category.name} 전체보기 ↗</button></div>
              <ProductCarousel label={category.name} className="home-category-products">
                {mockProducts.filter((product) => product.categoryId === category.id).sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 16).map((product) => <ProductCard key={product.id} product={product} showDiscount categoryName={category.name} ratingSummary={getProductRating(allProductReviews, product.id)} />)}
              </ProductCarousel>
            </section>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-products-title">
        <div className="home-section-heading">
          <div><p className="eyebrow">DAILY PICKS</p><h2 id="home-products-title">우리 아이를 위한 발견</h2></div>
          <button type="button" className="home-text-button" onClick={() => openShop(selectedPet)}>상품 전체보기 <span aria-hidden="true">↗</span></button>
        </div>
        <div className="home-filters" role="group" aria-label="추천 상품 동물 선택">
          {PET_OPTIONS.map((option) => <button type="button" key={option.value} aria-pressed={selectedPet === option.value} onClick={() => setSelectedPet(option.value)}>{option.label}</button>)}
        </div>
        <ProductCarousel key={selectedPet} label="우리 아이를 위한 발견">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} showDiscount categoryName={mockCategories.find((category) => category.id === product.categoryId)?.name} ratingSummary={getProductRating(allProductReviews, product.id)} />)}
        </ProductCarousel>
      </section>

      <section className="home-care" aria-labelledby="home-care-title">
        <img className="home-banner-image" src={CARE_BANNER_IMAGE} alt="" loading="lazy" decoding="async" width="2804" height="561" />
        <div className="home-care-copy">
          {/* 글을 한 묶음으로 둔다 — HomePage.css `.home-care p:last-child` 가 설명 문단을 잡으려면 링크와 떨어져 있어야 한다 */}
          <div><p className="eyebrow">CARE, WITH LOVE</p><h2 id="home-care-title">함께하지 못하는 시간에도,<br />따뜻한 돌봄이 이어지도록.</h2><p>우리 아이에게 맞는 펫시터를 만나보세요.<br />지역과 돌봄 서비스를 선택하고 예약할 수 있어요.</p></div>
          <Link className="arrow-button" to="/sitters">펫시터 찾기 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="home-section home-top-sitters" aria-labelledby="home-sitters-title">
        <div className="home-section-heading"><div><p className="eyebrow">OUR TOP SITTERS</p><h2 id="home-sitters-title">보호자들이 추천하는 우수 펫시터</h2></div><Link to="/sitters">펫시터 전체보기 ↗</Link></div>
        <p className="home-sitters-note">다시 맡기고 싶은 돌봄, 보호자들의 후기로 만나보세요.</p>
        <div className="home-sitters-grid">{topSitters.map(({ sitter, summary }) => <SitterCard key={sitter.id} sitter={sitter} regionName={mockRegions.find((region) => region.id === sitter.regionId)?.name} serviceNames={sitter.services.map((service) => mockServices.find((item) => item.id === service.serviceId)?.name)} lowestPrice={getLowestServicePrice(sitter.services)} ratingText={formatRating(summary.average)} isExcellent={isExcellentSitter(summary.average)} />)}</div>
      </section>
    </div>
  );
}

export { HomePage };
