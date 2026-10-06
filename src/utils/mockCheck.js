// 기초 데이터(mock) 검사.
//
// 앱이 처음 뜰 때 Layout 이 한 번 부른다. 어긋난 곳이 있으면 상품 목록·예약서에 '기초 데이터 오류' 를
// 안내하고 담기·주문·예약을 막는다.
// 저장 데이터 오류(utils/storage.js)와 섞지 않는다 — 원인이 다르고 안내 문구도 다르다.
// 지금 데이터는 모두 통과한다. mock 을 고칠 때 틀린 값이 화면까지 가지 않게 하는 안전망이다.

import { mockCategories } from '../mocks/mockCategories.js';
import { mockProductReviews } from '../mocks/mockProductReviews.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { mockPromotions } from '../mocks/mockPromotions.js';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockReviews } from '../mocks/mockReviews.js';
import { mockServices } from '../mocks/mockServices.js';
import { mockSitters } from '../mocks/mockSitters.js';
import { PET_TYPE_LABELS } from './constants.js';
import { WEEKDAY_KEYS } from './datetime.js';
import { usesDropOffPickUp } from './reservation.js';

const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFilledString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isIntegerBetween(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function isPetTypeList(petTypes) {
  return (
    Array.isArray(petTypes) &&
    petTypes.length > 0 &&
    petTypes.every((petType) => Object.hasOwn(PET_TYPE_LABELS, petType))
  );
}

function isValidList(items, isValidItem) {
  if (!Array.isArray(items) || !items.every((item) => isObject(item) && isValidItem(item))) {
    return false;
  }
  const ids = items.map((item) => item.id);
  return ids.every(isFilledString) && new Set(ids).size === ids.length;
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isValidProduct(product) {
  return (
    isFilledString(product.name) &&
    mockCategories.some((category) => category.id === product.categoryId) &&
    isPetTypeList(product.petTypes) &&
    isIntegerBetween(product.price, 0, Number.MAX_SAFE_INTEGER) &&
    isIntegerBetween(product.discountPercent, 0, 100) &&
    typeof product.imageUrl === 'string'
  );
}

function isValidSitter(sitter) {
  if (
    !isFilledString(sitter.name) ||
    !mockRegions.some((region) => region.id === sitter.regionId) ||
    !isPetTypeList(sitter.petTypes) ||
    !Array.isArray(sitter.services) ||
    sitter.services.length === 0 ||
    !Array.isArray(sitter.availableHours)
  ) {
    return false;
  }

  const serviceIds = sitter.services.map((item) => item.serviceId);
  const days = sitter.availableHours.map((hour) => hour.day);
  if (new Set(serviceIds).size !== serviceIds.length || new Set(days).size !== days.length) {
    return false;
  }

  const hoursOk = sitter.availableHours.every(
    (hour) =>
      WEEKDAY_KEYS.includes(hour.day) &&
      TIME_PATTERN.test(hour.startTime) &&
      TIME_PATTERN.test(hour.endTime) &&
      hour.startTime < hour.endTime
  );
  if (!hoursOk) {
    return false;
  }

  // 받는 동물마다 그 동물이 쓸 수 있는 서비스가 하나는 있어야 한다 — 없으면 카드·상세에는 받는다고
  // 보이는데 예약서에서는 그 동물을 고를 수 없다
  const acceptsEveryPetType = sitter.petTypes.every((petType) =>
    sitter.services.some((item) => {
      const service = mockServices.find((entry) => entry.id === item.serviceId);
      return service !== undefined && service.petTypes.includes(petType);
    })
  );
  if (!acceptsEveryPetType) {
    return false;
  }

  // 제공 서비스 1단위는 그 펫시터의 가장 긴 요일 시간대 안에 들어가야 한다.
  // 장기 돌봄은 맡기는 시각·찾는 시각만 보므로 이 조건에서 뺀다
  const longestMinutes = Math.max(
    0,
    ...sitter.availableHours.map((hour) => toMinutes(hour.endTime) - toMinutes(hour.startTime))
  );
  return sitter.services.every((item) => {
    const service = mockServices.find((entry) => entry.id === item.serviceId);
    return (
      service !== undefined &&
      isIntegerBetween(item.price, 0, Number.MAX_SAFE_INTEGER) &&
      (usesDropOffPickUp(service.id) || service.durationMinutes <= longestMinutes)
    );
  });
}

function isValidSitterReview(review) {
  const service = mockServices.find((entry) => entry.id === review.serviceId);
  return (
    isIntegerBetween(review.rating, 1, 5) &&
    mockSitters.some((sitter) => sitter.id === review.sitterId) &&
    service !== undefined &&
    service.petTypes.includes(review.petType)
  );
}

function isValidProductReview(review) {
  return (
    isIntegerBetween(review.rating, 1, 5) &&
    mockProducts.some((product) => product.id === review.productId)
  );
}

function isValidPromotion(promotion) {
  return (
    Array.isArray(promotion.productIds) &&
    new Set(promotion.productIds).size === promotion.productIds.length &&
    promotion.productIds.every((id) => mockProducts.some((product) => product.id === id))
  );
}

// 걸린 대상의 이름을 모두 돌려준다. 빈 배열이면 통과다.
function checkMockData() {
  const checks = [
    ['상품', isValidList(mockProducts, isValidProduct)],
    ['상품 분류', isValidList(mockCategories, (item) => isFilledString(item.name))],
    ['지역', isValidList(mockRegions, (item) => isFilledString(item.name))],
    ['서비스', isValidList(mockServices, (item) => isPetTypeList(item.petTypes))],
    ['펫시터', isValidList(mockSitters, isValidSitter)],
    ['펫시터 후기', isValidList(mockReviews, isValidSitterReview)],
    ['상품 리뷰', isValidList(mockProductReviews, isValidProductReview)],
    ['기획전', isValidList(mockPromotions, isValidPromotion)]
  ];
  return checks.filter(([, ok]) => !ok).map(([name]) => name);
}

export { checkMockData };
