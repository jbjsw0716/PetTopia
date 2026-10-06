import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultStore, loadStore, saveStore } from '../src/utils/storage.js';

test('찜 저장·복원은 순서와 다른 저장 항목을 보존한다', (t) => {
  let saved = null;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => saved,
    setItem: (_key, value) => { saved = value; }
  } });
  t.after(() => { if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor); else delete globalThis.localStorage; });
  const store = createDefaultStore();
  store.wishlistProductIds = ['P002', 'P001'];
  assert.equal(saveStore(store).ok, true);
  assert.deepEqual(loadStore(), { status: 'ready', store });
  // 판매 종료 ID는 복원 오류가 아니라 화면에서 생략할 대상이다.
  store.wishlistProductIds = ['removed-product'];
  saveStore(store);
  assert.equal(loadStore().status, 'ready');
  for (const ids of [['P001', 'P001'], [''], [123], null]) {
    saved = JSON.stringify({ ...store, wishlistProductIds: ids });
    const before = saved;
    assert.equal(loadStore().status, 'error');
    assert.equal(saved, before);
  }
});

test('저장소 쓰기 실패를 성공으로 반환하지 않는다', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    setItem: () => { throw new Error('Quota exceeded'); }
  } });
  t.after(() => { if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor); else delete globalThis.localStorage; });
  assert.deepEqual(saveStore(createDefaultStore()), { ok: false });
});
