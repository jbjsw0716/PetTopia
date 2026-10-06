import { Link } from 'react-router-dom';
import './Footer.css';

// 표시 여부를 Footer 가 판단하지 않는다. 무한 스크롤 화면에서 다 불러온 뒤에만 보이는 조건은
// Layout 이 isListComplete 로 정한다.
//
// enabledMenus 는 Header 가 받는 것과 같은 객체다 (Layout 의 ENABLED_MENUS).
// 고객센터 항목은 공지사항(/notices)으로 가는 메뉴라 support 가 켜질 때만 내보낸다 —
// 구현하지 않은 기능의 메뉴·버튼을 화면에 내보내지 않는다.
//
// 택배 조회를 넣지 않는다.
function Footer({ enabledMenus = {} }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <section className="site-footer-item">
          <h2 className="site-footer-title">쇼핑몰 정보</h2>
          <p className="site-footer-text">업체명 : (주)펫토피아</p>
          <p className="site-footer-text">대표자 : 정상욱</p>
          <p className="site-footer-text">주소 : 서울 강남구 테헤란로 70길 12 H타워 9층</p>
          <p className="site-footer-text">대표 번호 : 02-3482-4632~5</p>
          <p className="site-footer-text">사업자등록번호 : 123-45-67890</p>
        </section>

        <section className="site-footer-item">
          <h2 className="site-footer-title">약관 및 정책</h2>
          <div className="site-footer-links">
            <Link className="site-footer-link" to="/policies/privacy">
              개인정보 처리방침
            </Link>
            <Link className="site-footer-link" to="/policies/terms">
              이용약관
            </Link>
            <Link className="site-footer-link" to="/policies/operation">
              운영 및 관리방침
            </Link>
          </div>
        </section>

        {/* 부모가 꺼져 있으면 제목까지 함께 내보내지 않는다 — Header 가 메뉴를 거르는 방식과 같다 */}
        {enabledMenus.support ? (
          <section className="site-footer-item">
            <h2 className="site-footer-title">고객센터</h2>
            <div className="site-footer-links">
              <Link className="site-footer-link" to="/notices">
                공지사항
              </Link>
              <Link className="site-footer-link" to="/faq">자주 묻는 질문</Link>
              <Link className="site-footer-link" to="/inquiries">1:1 문의 · 내 문의 확인</Link>
            </div>
          </section>
        ) : null}
        <div className="site-footer-bottom">
          <Link className="site-footer-logo" to="/" aria-label="펫토피아 홈">
            <img
              src="/Pet_Topia_02_Humanist_transparent.png"
              alt="펫토피아"
              width="630"
              height="762"
              loading="lazy"
            />
          </Link>
          <p className="site-footer-copyright">Copyright by PETTOPIA All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
