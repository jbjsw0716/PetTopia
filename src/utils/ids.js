// 새 기록의 번호를 만든다 — 주문 O001 · 예약 RS001.
//
// 빈 배열 가드가 필요하다. Math.max() 는 인자가 없으면 -Infinity 다.
// 여기서는 for 로 훑으며 0 에서 시작해 같은 문제를 피한다.
//
// 주문과 예약이 같은 규칙을 쓰되 이름만 나눈다. 그래서 접두어를 인자로 받는다.

// items 는 { id } 를 가진 배열이다. prefix 는 번호 앞에 붙는 머리글자, digits 는 자릿수(3)다.
// 저장 직전 중복 확인은 부르는 쪽이 한 번 더 한다.
// 이 함수는 "지금 배열 기준의 다음 번호" 만 만든다.
function createNextId(items, prefix, digits) {
  let maxNumber = 0;

  for (const item of items) {
    // 형식에 맞지 않는 번호는 건너뛴다. 저장 데이터가 섞여 있어도 NaN 이 끼지 않게 한다
    if (typeof item.id !== 'string' || !item.id.startsWith(prefix)) {
      continue;
    }

    const rest = item.id.slice(prefix.length);
    if (!/^[0-9]+$/.test(rest)) {
      continue;
    }

    const number = Number(rest);
    if (number > maxNumber) {
      maxNumber = number;
    }
  }

  // 999 를 넘으면 네 자리가 된다. 자릿수를 넘겨도 번호가 겹치지 않는 쪽을 택한다
  return prefix + String(maxNumber + 1).padStart(digits, '0');
}

export { createNextId };
