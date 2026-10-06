import { assistantKeywords } from '../mocks/mockAssistant.js';
import { mockProducts } from '../mocks/mockProducts.js';
import { mockSitters } from '../mocks/mockSitters.js';
import { mockFaqs } from '../mocks/mockFaqs.js';
import { mockRegions } from '../mocks/mockRegions.js';
import { mockServices } from '../mocks/mockServices.js';
import { mockCategories } from '../mocks/mockCategories.js';
import { PET_TYPE_LABELS } from './constants.js';
import { formatWon } from './money.js';

function findKeywords(dictionary, text) {
  return Object.keys(dictionary).filter((key) => dictionary[key].some((word) => text.includes(word)));
}

function getAssistantReply(input) {
  const text = input.trim().toLowerCase();
  const pets = findKeywords(assistantKeywords.pets, text);
  const categories = findKeywords(assistantKeywords.categories, text);
  const services = findKeywords(assistantKeywords.services, text);
  const regions = mockRegions.filter((region) => text.includes(region.name.replace('서울 ', '').replace(/구$/, '')));
  const compact = text.replace(/[\s,]/g, '');
  // '만' 뒤의 숫자는 '천' 이 없어도 받는다('1만5000원'). '천' 이 있을 때만 받으면 그 자리에서 실패한 뒤
  // 뒤쪽 '5000원이하' 만 따로 잡혀 5,000원이 된다.
  const amount = compact.match(/(\d+(?:\.\d+)?)(만|천)?(?:(\d+)(천)?)?원?(이하|미만|이상|초과)/);
  const price = amount ? Number(amount[1]) * (amount[2] === '만' ? 10000 : amount[2] === '천' ? 1000 : 1) + Number(amount[3] || 0) * (amount[4] === '천' ? 1000 : 1) : null;
  const comparison = amount?.[5];
  const matchesPrice = (value) => price === null || (comparison === '이하' ? value <= price : comparison === '미만' ? value < price : comparison === '이상' ? value >= price : value > price);
  const scores = Object.fromEntries(Object.entries(assistantKeywords.intents).map(([key, words]) => [key, words.filter((word) => text.includes(word)).length * 2]));
  scores.product += categories.length * 3;
  scores.sitter += services.length * 2 + regions.length * 2;
  const faqTokens = text.split(/\s+/).map((word) => word.replace(/(은|는|이|가|을|를|에|도)$/, '')).filter((word) => word.length > 1);
  const faqs = mockFaqs.map((faq) => ({ faq, score: faqTokens.filter((word) => faq.question.includes(word)).length })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
  if (scores.faq > 0 && faqs.length) scores.faq += 4;
  const intent = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  if (scores[intent] === 0) return { type: 'fallback', message: '상품 종류나 돌봄 지역, 서비스를 함께 알려주세요. 아래 예시로도 시작할 수 있어요.' };
  if (intent === 'faq') return faqs.length ? { type: 'faq', message: '관련 이용 안내를 찾았어요.', faqs: faqs.slice(0, 3).map((entry) => entry.faq) } : { type: 'fallback', message: '해당 안내를 찾지 못했어요. “배송비 안내”처럼 질문하거나 FAQ를 확인해 주세요.' };
  const conditions = [...pets.map((pet) => PET_TYPE_LABELS[pet]), ...(price === null ? [] : [formatWon(price) + ' ' + comparison])];
  if (intent === 'product') {
    conditions.push(...categories.map((id) => mockCategories.find((category) => category.id === id)?.name));
    const products = mockProducts.filter((product) => pets.every((pet) => product.petTypes.includes(pet)) && (categories.length === 0 || categories.includes(product.categoryId)) && matchesPrice(product.price));
    return { type: 'product', conditions: conditions.join(' · '), message: products.length ? `조건에 맞는 상품 ${products.length}개를 찾았어요. 가격 조건은 정가 기준이에요.` : '조건에 맞는 상품이 없어요. 상품 종류나 가격 범위를 바꿔 주세요.', products };
  }
  conditions.push(...regions.map((region) => region.name), ...services.map((id) => mockServices.find((service) => service.id === id)?.name));
  const sitters = mockSitters.filter((sitter) => pets.every((pet) => sitter.petTypes.includes(pet)) && (regions.length === 0 || regions.some((region) => region.id === sitter.regionId)) && sitter.services.some((service) => (services.length === 0 || services.includes(service.serviceId)) && pets.every((pet) => mockServices.find((item) => item.id === service.serviceId)?.petTypes.includes(pet)) && matchesPrice(service.price)));
  return { type: 'sitter', conditions: conditions.join(' · '), message: sitters.length ? `조건에 맞는 펫시터 ${sitters.length}명을 찾았어요. 요금은 서비스 1단위 기준이며, 예약 가능한 일정은 상세에서 확인해 주세요.` : '조건에 맞는 펫시터가 없어요. 지역·서비스·가격 조건을 바꿔 주세요.', sitters };
}

export { getAssistantReply };
