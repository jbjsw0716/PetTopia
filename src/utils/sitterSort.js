import { getRatingSummary, isExcellentSitter } from './rating.js';

const SITTER_SORT_OPTIONS = [
  { value: 'default', label: '기본순' },
  { value: 'ratingDesc', label: '평점 높은 순' },
  { value: 'ratingAsc', label: '평점 낮은 순' },
  { value: 'excellent', label: '우수 펫시터 우선' },
  { value: 'reviewsDesc', label: '후기 많은 순' },
  { value: 'name', label: '이름순' }
];

function sortSitters(sitters, sortType, reviews) {
  if (sortType === 'default' || !SITTER_SORT_OPTIONS.some((option) => option.value === sortType)) return [...sitters];
  const rows = sitters.map((sitter) => ({ sitter, summary: getRatingSummary(reviews, sitter.id) }));
  rows.sort((a, b) => {
    let difference = 0;
    if (sortType === 'ratingDesc') difference = (b.summary.average ?? 0) - (a.summary.average ?? 0);
    if (sortType === 'ratingAsc') difference = (a.summary.average ?? 0) - (b.summary.average ?? 0);
    if (sortType === 'excellent') difference = Number(isExcellentSitter(b.summary.average)) - Number(isExcellentSitter(a.summary.average));
    if (sortType === 'reviewsDesc') difference = b.summary.count - a.summary.count;
    return difference || a.sitter.name.localeCompare(b.sitter.name, 'ko') || a.sitter.id.localeCompare(b.sitter.id);
  });
  return rows.map(({ sitter }) => sitter);
}

export { SITTER_SORT_OPTIONS, sortSitters };
