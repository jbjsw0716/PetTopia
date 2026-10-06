import { Link } from 'react-router-dom';
import { mockPromotions } from '../mocks/mockPromotions.js';
import './PromotionListPage.css';

function PromotionListPage() {
  return (
    <div className="promotion-list">
      <p className="eyebrow">SPECIAL OFFERS</p>
      <h1>오늘의 작은 행복, 기획전</h1>
      <p>반려생활에 꼭 필요한 것들을 주제별로 만나보세요.</p>
      <div className="promotion-list-grid">
        {mockPromotions.map((promotion, index) => (
          <Link className="promotion-list-card" key={promotion.id} to={'/promotions/' + promotion.id}>
            <img className="promotion-list-image" src={promotion.imageUrl} alt={promotion.imageAlt} width="1448" height="1086" decoding="async" />
            <div className="promotion-list-copy">
            <span className="promotion-list-number">0{index + 1} / PETTOPIA SELECTION</span>
            <h2>{promotion.title}</h2>
            <p>{promotion.description}</p>
            <strong>기획전 둘러보기 ↗</strong>
            </div>
          </Link>
        ))}
      </div>
      {mockPromotions.length === 0 && <p>새로운 기획전을 준비하고 있습니다.</p>}
    </div>
  );
}

export { PromotionListPage };
