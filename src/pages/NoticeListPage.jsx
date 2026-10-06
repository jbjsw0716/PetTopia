import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { mockNotices } from '../mocks/mockNotices.js';
import { PAGE_SIZE } from '../utils/constants.js';
import './NoticeListPage.css';

// S-15 공지사항 — F-27 조회 · F-35 페이지네이션 (한 페이지 10건).
// 고객센터 목록은 페이지네이션이다. 무한 스크롤과 한 화면에 섞지 않는다.

function NoticeListPage() {
  const [page, setPage] = useState(1);

  // 작성일 최신순. 같은 날이면 번호가 큰 것이 먼저다.
  // 복사본을 정렬한다 — import 한 원본을 직접 고치지 않는다.
  const sortedNotices = [...mockNotices].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
  );
  const start = (page - 1) * PAGE_SIZE;
  const pageNotices = sortedNotices.slice(start, start + PAGE_SIZE);

  return (
    <div className="notice-list">
      <div className="notice-list-head">
        <h1>공지사항</h1>
        <p className="notice-list-count">전체 {sortedNotices.length}건</p>
      </div>

      {sortedNotices.length === 0 ? (
        <EmptyState message="등록된 공지사항이 없습니다." />
      ) : (
        <>
          <ul className="notice-list-items">
            {pageNotices.map((notice) => (
              <li className="notice-list-item" key={notice.id}>
                <Link className="notice-list-link" to={'/notices/' + notice.id}>
                  <span className="notice-list-title">{notice.title}</span>
                  <span className="notice-list-date">{notice.createdAt}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            totalCount={sortedNotices.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export { NoticeListPage };
