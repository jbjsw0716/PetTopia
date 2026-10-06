// 로그인을 구현하지 않고 "로그인된 상태" 를 가정한다.
//
// profile 을 바꾸는 곳은 마이페이지뿐이다.
//
// phone 은 하이픈을 넣은 정규화 형태로 저장한다.
// 문자열로 두어야 앞자리 0 이 사라지지 않는다.

const mockProfile = {
  name: '김보호',
  phone: '010-0000-0000',
  address: '서울시 예시구 반려로 10',
  pet: {
    name: '콩이',
    petType: 'DOG',
    age: 3,
    note: '낯선 사람을 조금 경계합니다'
  }
};

export { mockProfile };
