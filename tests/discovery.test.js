import assert from 'node:assert/strict';
import test from 'node:test';
import { getAssistantReply } from '../src/utils/assistant.js';
import { mockPromotions } from '../src/mocks/mockPromotions.js';
import { mockProducts } from '../src/mocks/mockProducts.js';
import { mockFaqs } from '../src/mocks/mockFaqs.js';
import { sortProducts } from '../src/utils/productSort.js';
import { getLineTotal, getDiscountedPrice } from '../src/utils/money.js';

test('기획전 참조 무결성과 공통 정렬의 원본 보존', () => {
  assert.ok(mockPromotions.length >= 3);
  for (const promotion of mockPromotions) {
    assert.ok(promotion.productIds.length > 12);
    assert.equal(new Set(promotion.productIds).size, promotion.productIds.length);
    assert.ok(promotion.productIds.every((id) => mockProducts.some((product) => product.id === id)));
  }
  const original = mockProducts.map((product) => product.id);
  // '낮은 가격' 은 카드에 크게 보이는 할인가 순이다
  const shown = (product) => getDiscountedPrice(product.price, product.discountPercent);
  const sorted = sortProducts(mockProducts, 'priceAsc');
  assert.ok(sorted.every((product, i) => i === 0 || shown(product) >= shown(sorted[i - 1])));
  assert.deepEqual(mockProducts.map((product) => product.id), original);
});

test('상품 동의어·동물·분류·가격 조건 결합 및 경계', () => {
  for (const query of ['강아지 간식 2만원 이하', '반려견 트릿 20,000원 이하', '강아지 간식 1만 5천원 이하']) {
    const reply = getAssistantReply(query);
    assert.equal(reply.type, 'product');
    assert.ok(reply.products.length > 0);
    assert.ok(reply.products.every((product) => product.petTypes.includes('DOG') && product.categoryId === 'SNACK' && product.price <= (query.includes('5천') ? 15000 : 20000)));
  }
  const reply = getAssistantReply('고양이 장난감 10000원 미만');
  assert.ok(reply.products.every((product) => product.petTypes.includes('CAT') && product.categoryId === 'TOY' && product.price < 10000));
  assert.equal(getAssistantReply('간식 1원 이하').products.length, 0);
});

test('펫시터는 선택한 서비스와 가격을 같은 서비스 항목에서 판정', () => {
  const reply = getAssistantReply('강남 산책 펫시터 2만원 이하');
  assert.equal(reply.type, 'sitter');
  assert.ok(reply.sitters.length > 0);
  assert.ok(reply.sitters.every((sitter) => sitter.regionId === 'GANGNAM' && sitter.services.some((service) => service.serviceId === 'WALK' && service.price <= 20000)));
  assert.equal(getAssistantReply('고양이 산책 펫시터').sitters.length, 0);
});

test('FAQ 답변 재사용, 미인식과 검색 결과 없음 구분', () => {
  const reply = getAssistantReply('배송비 안내');
  assert.equal(reply.type, 'faq');
  assert.equal(reply.faqs[0].answer, mockFaqs.find((faq) => faq.id === 'F001').answer);
  assert.equal(getAssistantReply('오늘 날씨 알려줘').type, 'fallback');
  assert.equal(getAssistantReply('주문 취소 방법').faqs[0].id, 'F026');
  assert.equal(getAssistantReply('예약 취소는 어떻게 하나요').faqs[0].id, 'F027');
  assert.equal(getAssistantReply('간식 1원 이하').type, 'product');
});

test('할인 금액은 항목별 원 단위 버림으로 구매 금액에 적용', () => {
  assert.equal(getDiscountedPrice(9990, 15), 8492);
  assert.equal(getLineTotal(9990, 15, 2), 16983);
  assert.equal(getLineTotal(16000, 0, 2), 32000);
});
