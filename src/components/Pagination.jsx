import { PAGE_SIZE } from '../utils/constants.js';
import './Pagination.css';

// 전체 쪽수와 이전·다음 비활성화만 계산한다. 목록을 자르는 것은 화면이다.
//
// 조건이 바뀔 때 page 를 1로 되돌리는 것은 화면의 책임이다.
// 여기서는 되돌리지 않는다 — 어떤 조건이 바뀌었는지 모르기 때문이다.
function Pagination({
  page = 1,
  totalCount = 0,
  pageSize = PAGE_SIZE,
  onPageChange = () => {}
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = [];
  for (let number = 1; number <= totalPages; number += 1) {
    pageNumbers.push(number);
  }

  return (
    <nav className="pagination">
      <button
        type="button"
        className="pagination-button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </button>

      {pageNumbers.map((number) => (
        <button
          key={number}
          type="button"
          className={
            number === page ? 'pagination-button is-current' : 'pagination-button'
          }
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}

      <button
        type="button"
        className="pagination-button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </button>
    </nav>
  );
}

export { Pagination };
