import { Children, useEffect, useRef } from 'react';
import './InfiniteList.css';

// 자르는 것은 화면이다. 화면이 items.slice(0, visibleCount) 한 결과를 children 으로 넣는다.
// 여기서는 바닥 감지와 안내 문구만 맡는다.
//
// 0건이거나 불러오기에 실패한 경우도 화면이 isComplete 를 true 로 넘긴다.
// 0건일 때 목록 대신 EmptyState 를 그릴지는 화면이 정한다.
function InfiniteList({
  children,
  isComplete = true,
  isLoadingMore = false,
  completeMessage = '모든 결과를 확인하셨습니다.',
  onLoadMore = () => {}
}) {
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(onLoadMore);
  const itemCount = Children.count(children);

  // 화면이 useCallback 을 쓰지 않으므로(수업 미학습) onLoadMore 는 렌더마다 새 함수다.
  // ref 에 담아 두면 관찰자를 다시 만들지 않고도 최신 함수를 부를 수 있다.
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    // isLoadingMore 가 true 면 onLoadMore 를 다시 부르지 않는다 —
    // 같은 묶음을 두 번 불러오지 않기 위해서다.
    if (isComplete || isLoadingMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreRef.current();
      }
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
    // 카드 수(itemCount)가 바뀌면 관찰자를 다시 만든다.
    // IntersectionObserver 는 '걸쳐 있는 상태가 바뀔 때' 만 알려 준다. 다음 묶음을 이어 붙인
    // 뒤에도 바닥 감지 자리가 화면에 그대로 남아 있으면 상태가 바뀌지 않아 다시 부르지 못하고
    // 목록이 멈춘다. 새로 만든 관찰자는 지금 걸쳐 있는지를 한 번 알려 주므로 이어서 불러온다.
  }, [isComplete, isLoadingMore, itemCount]);

  return (
    <div className="infinite-list">
      <div className="infinite-list-items">{children}</div>

      {isComplete ? (
        <p className="infinite-list-status">{completeMessage}</p>
      ) : (
        <div className="infinite-list-more" ref={sentinelRef}>
          {isLoadingMore ? (
            <p className="infinite-list-status">더 불러오는 중입니다.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export { InfiniteList };
