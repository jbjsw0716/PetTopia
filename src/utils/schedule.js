// 펫시터 요일별 이용 가능 시간의 표시.
//
// mock 에는 이용 가능한 요일만 들어 있고 없는 요일은 휴무다. 특정 날짜가 아니라 요일로 적는다.
// 이웃한 요일 중 문구가 같은 것을 묶어 `월~금 09:00~18:00` · `토~일 휴무` 처럼 보인다.

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일'
};

// { label, text } 배열을 돌려준다. 예: [{ label: '월~금', text: '09:00~18:00' }, { label: '토~일', text: '휴무' }]
function formatAvailableHours(availableHours) {
  const texts = DAY_ORDER.map((day) => {
    const hour = availableHours.find((item) => item.day === day);
    return hour ? hour.startTime + '~' + hour.endTime : '휴무';
  });

  const groups = [];
  let start = 0;

  for (let index = 1; index <= DAY_ORDER.length; index += 1) {
    if (index === DAY_ORDER.length || texts[index] !== texts[start]) {
      const from = DAY_LABELS[DAY_ORDER[start]];
      const to = DAY_LABELS[DAY_ORDER[index - 1]];
      groups.push({
        label: index - 1 === start ? from : from + '~' + to,
        text: texts[start]
      });
      start = index;
    }
  }

  return groups;
}

export { formatAvailableHours };
