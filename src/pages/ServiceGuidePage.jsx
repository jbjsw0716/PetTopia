import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { mockServices } from '../mocks/mockServices.js';
import { PET_TYPE_LABELS } from '../utils/constants.js';
import { formatWon } from '../utils/money.js';
import './ServiceGuidePage.css';

// S-14 돌봄 서비스 안내 — F-26. 저장 데이터가 필요 없는 읽기 전용 화면이다.
//
// 여기 적는 금액은 기준 금액이다. 실제 요금은 펫시터마다 다르고 펫시터 상세에서 확정된다.
// 두 화면의 숫자가 달라 보이지 않게 "펫시터마다 다르다" 를 함께 적는다.
// 이용 안내(예약 가능 기간·이용 시간·취소)는 별도 화면을 만들지 않고 이 화면 안에 둔다.

// 예약 순서 네 단계. 이동 메뉴가 아니라 순서 안내라서 링크를 두지 않는다 —
// 예약서는 펫시터를 골라야 열리는 화면이다. 이동은 아래 `펫시터 찾기` 버튼이 맡는다.
const FLOW_STEPS = ['펫시터 찾기', '펫시터 상세', '예약서', '예약 완료'];

// 이용 안내 — 자주 묻는 문의(mock FAQ)에 이미 적힌 규칙과 같은 내용이다.
const GUIDE_ITEMS = [
  {
    title: '예약 가능 기간',
    text: '내일부터 30일 뒤까지의 날짜로 예약할 수 있습니다.'
  },
  {
    title: '이용 가능 시간',
    // 장기 돌봄은 맡기는 시각·찾는 시각을 따로 본다 (utils/reservation.js)
    text: '펫시터가 정한 요일별 이용 가능 시간 안에서 예약할 수 있습니다. 장기 돌봄은 맡기는 시각과 찾는 시각이 각각 그 날의 이용 가능 시간 안이어야 합니다. 같은 펫시터와 시간이 겹치는 예약은 등록할 수 없습니다.'
  },
  {
    title: '예약 취소',
    // 취소 버튼은 예약 상세에만 있다 — FAQ F027 과 같은 안내다
    text: '예약 시작일이 오늘보다 이후인 경우에만 예약 상세에서 취소할 수 있습니다.'
  }
];

// 기본 시간 문구. 60 → 1시간, 540 → 9시간, 1440 → 24시간
function formatDuration(minutes) {
  if (minutes % 60 === 0) {
    return minutes / 60 + '시간';
  }
  return minutes + '분';
}

function ServiceGuidePage() {
  return (
    <div className="service-guide">
      <h1>돌봄 서비스 안내</h1>

      <section className="service-guide-flow-section" aria-labelledby="service-guide-flow-title">
        <h2 id="service-guide-flow-title" className="service-guide-flow-title">
          예약 순서
        </h2>
        <ol className="service-guide-flow">
          {FLOW_STEPS.map((step, index) => (
            <li className="service-guide-flow-step" key={step}>
              <span className="service-guide-flow-number">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {mockServices.length === 0 ? (
        // 서비스 mock 이 없어도 예약 흐름 안내는 그대로 둔다
        <EmptyState message="서비스 안내를 불러오지 못했습니다." />
      ) : (
        <ul className="service-guide-services">
          {mockServices.map((service) => (
            <li className="service-guide-service" key={service.id}>
              <h2 className="service-guide-service-name">{service.name}</h2>
              <dl className="service-guide-facts">
                <dt>대상</dt>
                <dd>{service.petTypes.map((petType) => PET_TYPE_LABELS[petType]).join(' · ')}</dd>
                <dt>기본 시간</dt>
                <dd>{formatDuration(service.durationMinutes)}</dd>
                <dt>요금 단위</dt>
                <dd>{service.unitLabel}</dd>
                <dt>기준 금액</dt>
                <dd>
                  {formatWon(service.basePrice)} / {service.unitLabel}
                </dd>
                <dt>주의사항</dt>
                <dd>{service.caution}</dd>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <p className="service-guide-note">
        위 금액은 기준 금액이며 실제 요금은 펫시터마다 다릅니다. 펫시터별 요금은 펫시터 상세에서
        확인할 수 있습니다.
      </p>

      <section className="service-guide-usage">
        <h2 className="service-guide-usage-title">이용 안내</h2>
        <dl className="service-guide-usage-list">
          {GUIDE_ITEMS.map((item) => (
            <div className="service-guide-usage-item" key={item.title}>
              <dt>{item.title}</dt>
              <dd>{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Link className="service-guide-action" to="/sitters">
        펫시터 찾기
      </Link>
    </div>
  );
}

export { ServiceGuidePage };
