// 펫시터 평점.
//
// 평점은 펫시터에 저장하지 않고, 그 펫시터 후기의 평균을 표시할 때 계산한다.
// 소수 첫째 자리로 반올림하고, 후기가 0건이면 평균이 없다(null) — 0.0 으로 적지 않는다.

// reviews 는 mock 초기 후기와 저장된 후기를 합친 배열이다.
function getRatingSummary(reviews, sitterId) {
  let sum = 0;
  let count = 0;

  for (const review of reviews) {
    if (review.sitterId === sitterId) {
      sum += review.rating;
      count += 1;
    }
  }

  return {
    count,
    average: count === 0 ? null : Math.round((sum / count) * 10) / 10
  };
}

function formatRating(average) {
  return average === null ? '평점 없음' : average.toFixed(1);
}

function isExcellentSitter(average) {
  return average !== null && average >= 4.5;
}

export { getRatingSummary, formatRating, isExcellentSitter };
