import { Link } from 'react-router-dom';
import './NotFoundPage.css';

// S-26 페이지 없음 — F-43. 돌아가는 곳은 첫 화면(/ = 메인페이지)이다
function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>페이지 없음</h1>
      <p>요청한 주소를 찾을 수 없습니다.</p>
      <Link className="not-found-link" to="/">홈으로 가기</Link>
    </div>
  );
}

export { NotFoundPage };
