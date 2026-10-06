import test from 'node:test';
import assert from 'node:assert/strict';
import { sortSitters } from '../src/utils/sitterSort.js';

const sitters = [{ id: 'a', name: '하늘' }, { id: 'b', name: '가람' }, { id: 'c', name: '나래' }, { id: 'd', name: '다솜' }];
const reviews = [{ sitterId: 'a', rating: 5 }, { sitterId: 'b', rating: 5 }, { sitterId: 'd', rating: 3 }, { sitterId: 'd', rating: 4 }];
const ids = (type, data = reviews) => sortSitters(sitters, type, data).map((sitter) => sitter.id);

test('평점 정렬은 무평점 위치와 동률 이름순을 적용한다', () => {
  assert.deepEqual(ids('ratingAsc'), ['c', 'd', 'b', 'a']);
  assert.deepEqual(ids('ratingDesc'), ['b', 'a', 'd', 'c']);
});
test('우수 여부와 후기 수를 구분하고 추가 후기까지 반영한다', () => {
  assert.deepEqual(ids('excellent'), ['b', 'a', 'c', 'd']);
  assert.deepEqual(ids('reviewsDesc'), ['d', 'b', 'a', 'c']);
  assert.deepEqual(ids('ratingDesc', [...reviews, { sitterId: 'a', rating: 1 }]), ['b', 'd', 'a', 'c']);
});
test('이름순과 기본순을 지원하며 원본 순서는 변경하지 않는다', () => {
  assert.deepEqual(ids('name'), ['b', 'c', 'd', 'a']);
  assert.deepEqual(ids('default'), ['a', 'b', 'c', 'd']);
  assert.deepEqual(sitters.map((sitter) => sitter.id), ['a', 'b', 'c', 'd']);
});
