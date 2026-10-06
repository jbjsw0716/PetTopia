import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { mockNotices } from '../mocks/mockNotices.js';
import './NoticeDetailPage.css';

// S-16 공지 상세 — F-27. 공지만 별도 화면으로 둔다. 본문이 길어 목록 안에서 펼치면 목록을 밀어낸다.
// 대상은 URL 의 :noticeId 에 담겨 있어 새로고침·직접 접근에서도 그대로 보인다.

function NoticeDetailPage() {
  const { noticeId } = useParams();
  const notice = mockNotices.find((item) => item.id === noticeId);

  if (!notice) {
    return (
      <div className="notice-detail">
        <EmptyState
          message="요청한 공지사항을 찾을 수 없습니다."
          actionLabel="공지사항 목록으로"
          actionTo="/notices"
        />
      </div>
    );
  }

  return (
    <div className="notice-detail">
      <h1 className="notice-detail-title">{notice.title}</h1>
      <p className="notice-detail-date">{notice.createdAt}</p>
      <p className="notice-detail-body">{notice.content}</p>
      <Link className="notice-detail-back" to="/notices">
        목록으로
      </Link>
    </div>
  );
}

export { NoticeDetailPage };
