// 배열 순서가 화면에 보이는 순서다: 산책 → 방문 돌봄 → 데이케어 → 장기 돌봄.
// durationMinutes 는 종료 일시 계산에 쓴다 (종료 = 시작 + quantity × durationMinutes).

const mockServices = [
  {
    id: 'WALK',
    name: '산책',
    unit: 'HOUR',
    unitLabel: '시간',
    durationMinutes: 60,
    basePrice: 15000,
    petTypes: ['DOG'],
    caution: '목줄과 인식표를 준비해 주세요'
  },
  {
    id: 'VISIT',
    name: '방문 돌봄',
    unit: 'TIMES',
    unitLabel: '회',
    durationMinutes: 60,
    basePrice: 30000,
    petTypes: ['DOG', 'CAT'],
    caution: '사료와 급여량, 주의사항을 미리 알려주세요'
  },
  {
    id: 'DAYCARE',
    name: '데이케어',
    unit: 'DAY',
    unitLabel: '일',
    durationMinutes: 540,
    basePrice: 50000,
    petTypes: ['DOG'],
    caution: '이용 전 예방접종 여부를 확인해 주세요'
  },
  {
    id: 'BOARDING',
    name: '장기 돌봄',
    unit: 'NIGHT',
    unitLabel: '박',
    durationMinutes: 1440,
    basePrice: 70000,
    petTypes: ['DOG', 'CAT'],
    caution: '평소 사용하는 식기·장난감을 함께 보내 주시면 도움이 됩니다'
  }
];

export { mockServices };
