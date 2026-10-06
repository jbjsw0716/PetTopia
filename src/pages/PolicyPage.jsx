import { NavLink, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { FREE_SHIPPING_MIN, SHIPPING_FEE } from '../utils/constants.js';
import { formatWon } from '../utils/money.js';
import { MAX_DAYS_AHEAD } from '../utils/reservation.js';
import './PolicyPage.css';

// 약관 및 정책 — 푸터의 정책 링크 셋이 여는 화면이다. 글 셋이 한 화면을 쓰고 주소의 :policyId 로 고른다.
// 금액과 예약 기간은 계산에 쓰는 상수에서 가져온다. 규칙이 바뀌어도 글이 따라간다.
const POLICIES = [
  {
    id: 'privacy',
    title: '개인정보 처리방침',
    intro: '펫토피아는 서비스 이용에 필요한 정보만 처리합니다.',
    sections: [
      {
        heading: '1. 처리하는 항목',
        items: [
          '마이페이지: 이름, 연락처, 주소, 반려동물 정보(이름·종류·나이·특이사항)',
          '주문: 수령인 이름, 연락처, 주소',
          '펫시터 예약: 반려동물 정보, 이용 날짜와 시간',
          '1:1 문의·후기: 작성한 제목·내용·평점'
        ]
      },
      {
        heading: '2. 처리 목적',
        text: '주문한 상품의 배송 정보 확인, 펫시터 예약 확인, 문의 접수와 후기 게시에만 씁니다.'
      },
      {
        heading: '3. 보관 위치와 삭제',
        text:
          '입력한 정보와 이용 내역은 이용자의 브라우저에 저장됩니다. ' +
          '브라우저의 사이트 데이터를 삭제하면 함께 삭제됩니다.'
      },
      {
        heading: '4. 문의',
        text: '개인정보에 관한 문의는 고객센터의 1:1 문의로 접수할 수 있습니다.'
      }
    ]
  },
  {
    id: 'terms',
    title: '이용약관',
    sections: [
      {
        heading: '제1조 (목적)',
        text: '이 약관은 펫토피아가 제공하는 반려동물 용품 판매와 펫시터 예약 서비스의 이용 조건을 정합니다.'
      },
      {
        heading: '제2조 (주문과 배송비)',
        text:
          '장바구니에서 고른 상품을 주문서에서 배송 정보를 확인한 뒤 주문합니다. ' +
          '할인 후 금액이 ' + formatWon(FREE_SHIPPING_MIN) + ' 이상이면 배송비는 무료이고, ' +
          '그보다 적으면 ' + formatWon(SHIPPING_FEE) + '입니다.'
      },
      {
        heading: '제3조 (주문 취소)',
        text: "'주문 완료' 상태의 주문은 주문 상세에서 취소할 수 있습니다."
      },
      {
        heading: '제4조 (펫시터 예약)',
        text:
          '내일부터 ' + MAX_DAYS_AHEAD + '일 뒤까지, 펫시터가 정한 요일별 이용 가능 시간 안에서 예약할 수 있습니다. ' +
          '예약 시작일이 오늘보다 이후이면 예약 상세에서 취소할 수 있습니다.'
      },
      {
        heading: '제5조 (후기)',
        text: '이용이 끝난 예약마다 후기를 한 번 작성할 수 있습니다.'
      }
    ]
  },
  {
    id: 'operation',
    title: '운영 및 관리방침',
    sections: [
      {
        heading: '1. 상품 가격',
        text: '상품 상세에 표시된 할인가를 기준으로 합니다. 주문한 뒤에는 주문 당시 금액을 그대로 보관합니다.'
      },
      {
        heading: '2. 우수 펫시터',
        text: "평균 평점이 4.5점 이상인 펫시터에게 '우수 펫시터' 표시를 붙입니다."
      },
      {
        heading: '3. 후기와 문의',
        text: '서비스 이용에 관한 내용을, 다른 이용자를 존중하는 표현으로 적어 주세요.'
      },
      {
        heading: '4. 공지',
        text: '서비스 운영에 관한 변경 사항은 공지사항에서 알립니다.'
      }
    ]
  }
];

function PolicyPage() {
  const { policyId } = useParams();
  const policy = POLICIES.find((item) => item.id === policyId);

  return (
    <div className="policy">
      <nav className="policy-tabs" aria-label="약관 및 정책">
        {POLICIES.map((item) => (
          <NavLink key={item.id} className="policy-tab" to={'/policies/' + item.id}>
            {item.title}
          </NavLink>
        ))}
      </nav>

      {policy ? (
        <article>
          <h1 className="policy-title">{policy.title}</h1>
          {policy.intro ? <p className="policy-intro">{policy.intro}</p> : null}
          {policy.sections.map((section) => (
            <section className="policy-section" key={section.heading}>
              <h2 className="policy-section-title">{section.heading}</h2>
              {section.text ? <p className="policy-text">{section.text}</p> : null}
              {section.items ? (
                <ul className="policy-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      ) : (
        // 주소가 틀려도 위 탭으로 글을 고를 수 있다
        <>
          <h1 className="policy-title">약관 및 정책</h1>
          <EmptyState message="요청한 정책을 찾을 수 없습니다." />
        </>
      )}
    </div>
  );
}

export { PolicyPage };
