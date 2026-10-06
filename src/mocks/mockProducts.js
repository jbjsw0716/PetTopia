// 480건인 이유: 무한 스크롤 한 묶음이 12개이므로 12 * 40으로 딱 떨어지며,
// 카테고리/반려동물 유형별 필터링 시에도 충분한 데이터 양을 보장한다.
// '더 불러오는 중' → '다 불러옴' → 푸터 표시까지 확인할 수 있다.
//
// discountPercent 는 0~100 사이의 정수다. 0 이면 할인 없음.
// 항목별 할인액 = Math.floor(price * discountPercent * quantity / 100)
const baseProducts = [
  { name: '건강담은 강아지 사료', petTypes: ['DOG'], categoryId: 'FOOD', price: 16000, discountPercent: 10, description: '곡물을 넣지 않고 닭고기를 주원료로 만든 전연령 건식 사료입니다.' },
  { name: '깃털 낚싯대 장난감', petTypes: ['CAT'], categoryId: 'TOY', price: 9990, discountPercent: 15, description: '가벼운 막대에 깃털을 달아 사냥 놀이를 유도하는 장난감입니다.' },
  { name: '연어 오메가 강아지 사료', petTypes: ['DOG'], categoryId: 'FOOD', price: 24000, discountPercent: 0, description: '연어와 아마씨를 넣어 피부와 피모 관리를 돕는 사료입니다.' },
  { name: '시니어 관절 사료', petTypes: ['DOG'], categoryId: 'FOOD', price: 29000, discountPercent: 5, description: '노령견을 위해 알갱이를 작게 만들고 관절 성분을 더한 사료입니다.' },
  { name: '닭가슴살 트릿', petTypes: ['DOG'], categoryId: 'SNACK', price: 8900, discountPercent: 0, description: '닭가슴살만 건조해 만든 훈련용 간식입니다.' },
  { name: '칫솔 껌 30개입', petTypes: ['DOG'], categoryId: 'SNACK', price: 13500, discountPercent: 0, description: '씹는 동안 치석 관리를 돕는 모양으로 만든 덴탈 껌입니다.' },
  { name: '오리목뼈 수제간식', petTypes: ['DOG'], categoryId: 'SNACK', price: 11000, discountPercent: 20, description: '오리 목뼈를 저온에서 천천히 말린 수제 간식입니다.' },
  { name: '삑삑이 공 3종 세트', petTypes: ['DOG'], categoryId: 'TOY', price: 7500, discountPercent: 0, description: '물면 소리가 나는 말랑한 고무 공 세 개가 들어 있습니다.' },
  { name: '터그 로프 장난감', petTypes: ['DOG'], categoryId: 'TOY', price: 6900, discountPercent: 0, description: '면실을 꼬아 만들어 줄다리기 놀이에 쓰는 장난감입니다.' },
  { name: '노즈워크 담요', petTypes: ['DOG'], categoryId: 'TOY', price: 18900, discountPercent: 0, description: '주름 사이에 간식을 숨겨 코로 찾게 하는 놀이 담요입니다.' },
  { name: '발톱깎이와 줄 세트', petTypes: ['DOG'], categoryId: 'HYGIENE', price: 9500, discountPercent: 0, description: '미끄럼 방지 손잡이가 달린 발톱깎이와 다듬는 줄을 함께 담았습니다.' },
  { name: '저자극 강아지 샴푸', petTypes: ['DOG'], categoryId: 'HYGIENE', price: 14000, discountPercent: 0, description: '향료를 넣지 않아 피부가 예민한 반려견에게 쓰기 좋은 샴푸입니다.' },
  { name: '가슴줄 하네스 M', petTypes: ['DOG'], categoryId: 'OUTDOOR', price: 21000, discountPercent: 0, description: '가슴과 등에 힘이 나뉘어 목에 부담이 적은 산책용 하네스입니다.' },
  { name: '튼튼 이동장 M', petTypes: ['DOG', 'CAT'], categoryId: 'OUTDOOR', price: 39000, discountPercent: 0, description: '위쪽 문이 따로 열려 병원 이동이 편한 하드 케이스 이동장입니다.' },
  { name: '순면 배변패드 100매', petTypes: ['DOG', 'CAT'], categoryId: 'HYGIENE', price: 12000, discountPercent: 0, description: '흡수층을 세 겹으로 넣어 새지 않는 배변패드입니다.' },
  { name: '자동 급수기 2L', petTypes: ['DOG', 'CAT'], categoryId: 'HYGIENE', price: 32000, discountPercent: 10, description: '물을 순환시키고 필터로 걸러 주는 2리터 용량 급수기입니다.' },
  { name: '참치 고양이 사료', petTypes: ['CAT'], categoryId: 'FOOD', price: 19000, discountPercent: 0, description: '참치를 주원료로 만든 전연령 고양이 건식 사료입니다.' },
  { name: '연어 헤어볼 사료', petTypes: ['CAT'], categoryId: 'FOOD', price: 22500, discountPercent: 0, description: '식이섬유를 더해 털 뭉치 배출을 돕는 사료입니다.' },
  { name: '실내묘 저칼로리 사료', petTypes: ['CAT'], categoryId: 'FOOD', price: 15900, discountPercent: 0, description: '활동량이 적은 실내 고양이를 위해 열량을 낮춘 사료입니다.' },
  { name: '닭가슴살 츄르 20개입', petTypes: ['CAT'], categoryId: 'SNACK', price: 9800, discountPercent: 10, description: '짜서 먹이는 형태로 만든 수분 보충 간식 스무 개입니다.' },
  { name: '동결건조 연어 큐브', petTypes: ['CAT'], categoryId: 'SNACK', price: 12900, discountPercent: 0, description: '연어를 얼려 말려 한 입 크기로 자른 간식입니다.' },
  { name: '캣닢 쿠션 인형', petTypes: ['CAT'], categoryId: 'TOY', price: 5900, discountPercent: 0, description: '안쪽에 캣닢을 넣어 혼자서도 잘 노는 쿠션 인형입니다.' },
  { name: '회전 볼 트랙 장난감', petTypes: ['CAT'], categoryId: 'TOY', price: 16800, discountPercent: 0, description: '둥근 트랙 안에서 공이 돌아가 앞발 사냥을 유도하는 장난감입니다.' },
  { name: '벤토나이트 모래 10L', petTypes: ['CAT'], categoryId: 'LITTER', price: 14500, discountPercent: 0, description: '굳는 힘이 좋아 치우기 쉬운 벤토나이트 모래입니다.' },
  { name: '대형 후드 화장실', petTypes: ['CAT'], categoryId: 'LITTER', price: 36000, discountPercent: 0, description: '덮개가 있어 모래가 튀지 않는 대형 고양이 화장실입니다.' },
  { name: '원목 3단 캣타워', petTypes: ['CAT'], categoryId: 'TOWER', price: 89000, discountPercent: 15, description: '원목 기둥에 사이잘삼을 감아 스크래처를 겸하는 3단 캣타워입니다.' }
];

const prefixes = ['프리미엄', '유기농', '데일리', '플러스', '안심', '스마트', '친환경', '네이처', '올인원', '클린'];
const suffixes = ['스페셜', '에디션', '리뉴얼', '대용량', '세트', '프로', '케어', '클래식'];

// 강아지 관련 상품 사진 — public/images/products/ 에 있다. Pexels 무료 사진(Pexels License,
// 상업적 이용 가능 · 출처 표기 불필요)을 가로 600px 로 받은 것이다. 출처 사진 번호는
// public/images/products/dog-images-sources.txt 에 파일명별로 적어 뒀다(장수가 많아 여기엔 안 적는다).
//
// 품목마다 그 품목에 맞는 사진만 쓴다.
// 사진 장수가 그 품목의 상품 수(18~19)보다 적으면 앞에서부터 다시 쓴다 — 같은 품목 안에서만
// 반복되고, 목록에서 서로 멀리 떨어져 나온다.
//
// 이동장 · 배변패드 · 급수기는 강아지/고양이 공용 상품이라 고양이 사진과 한 상품씩 번갈아 쓴다
// (아래 SHARED_ITEM_CAT_IMAGES).
const DOG_ITEM_IMAGES = {
  '건강담은 강아지 사료': { slug: 'kibble', folder: 'products', count: 15 },
  '연어 오메가 강아지 사료': { slug: 'salmon-food', folder: 'products', count: 15 },
  '시니어 관절 사료': { slug: 'senior-food', folder: 'products', count: 15 },
  '닭가슴살 트릿': { slug: 'chicken-treat', folder: 'products', count: 19 },
  '칫솔 껌 30개입': { slug: 'dental-chew', folder: 'products', count: 19 },
  '오리목뼈 수제간식': { slug: 'bone-chew', folder: 'products', count: 19 },
  '삑삑이 공 3종 세트': { slug: 'ball', folder: 'products', count: 19 },
  '터그 로프 장난감': { slug: 'rope-toy', folder: 'products', count: 17 },
  '노즈워크 담요': { slug: 'snuffle-mat', folder: 'products', count: 19 },
  '발톱깎이와 줄 세트': { slug: 'nail-clipper', folder: 'products', count: 19 },
  '저자극 강아지 샴푸': { slug: 'shampoo', folder: 'products', count: 19 },
  '가슴줄 하네스 M': { slug: 'harness', folder: 'products', count: 18 },
  '튼튼 이동장 M': { slug: 'carrier', folder: 'products', count: 9 },
  '순면 배변패드 100매': { slug: 'pee-pad', folder: 'products', count: 9 },
  '자동 급수기 2L': { slug: 'water-fountain', folder: 'products', count: 9 }
};

// 고양이 전용 상품 사진 — public/images/cats/ 에 있다. Unsplash 사진(다운로드해 저장,
// 상업적 이용 가능)이고 일부 모자란 카테고리는 사용자가 직접 구해 추가했다.
// 파일명은 <slug>-01.jpg ~ <slug>-NN.jpg 형태로 두 자리 번호가 붙어 있다.
//
// 벤토나이트 모래(litter-sand)는 Unsplash·Pixabay·Pexels 어디에도 낱개 모래 제품 사진이 거의 없어
// 처음엔 3장뿐이었고, 부족분을 사용자가 직접 채워 지금은 18장이다.
// 원본 크기로 들어온 18번 사진 5장(ball-toy·cat-tower·litter-sand·plush-toy·salmon-food)은
// 다른 사진과 같게 가로 800px 로 줄였다.
const CAT_ITEM_IMAGES = {
  '깃털 낚싯대 장난감': { slug: 'feather-wand', folder: 'cats', count: 19, pad: 2 },
  '참치 고양이 사료': { slug: 'tuna-food', folder: 'cats', count: 18, pad: 2 },
  '연어 헤어볼 사료': { slug: 'salmon-food', folder: 'cats', count: 18, pad: 2 },
  '실내묘 저칼로리 사료': { slug: 'indoor-food', folder: 'cats', count: 18, pad: 2 },
  '닭가슴살 츄르 20개입': { slug: 'chicken-treats', folder: 'cats', count: 18, pad: 2 },
  '동결건조 연어 큐브': { slug: 'freeze-dried-treats', folder: 'cats', count: 18, pad: 2 },
  '캣닢 쿠션 인형': { slug: 'plush-toy', folder: 'cats', count: 18, pad: 2 },
  '회전 볼 트랙 장난감': { slug: 'ball-toy', folder: 'cats', count: 18, pad: 2 },
  '벤토나이트 모래 10L': { slug: 'litter-sand', folder: 'cats', count: 18, pad: 2 },
  '대형 후드 화장실': { slug: 'litter-box', folder: 'cats', count: 18, pad: 2 },
  '원목 3단 캣타워': { slug: 'cat-tower', folder: 'cats', count: 18, pad: 2 }
};

// 공용 상품의 고양이 사진. 품목의 첫 상품(P014~P016)이 고양이 필터 첫 화면에 나오므로
// 고양이 사진부터 시작해 강아지 사진과 한 상품씩 번갈아 붙인다.
const SHARED_ITEM_CAT_IMAGES = {
  '튼튼 이동장 M': { slug: 'carrier', folder: 'cats', count: 9, pad: 2 },
  '순면 배변패드 100매': { slug: 'pee-pad', folder: 'cats', count: 9, pad: 2 },
  '자동 급수기 2L': { slug: 'water-fountain', folder: 'cats', count: 9, pad: 2 }
};

const ITEM_IMAGES = { ...DOG_ITEM_IMAGES, ...CAT_ITEM_IMAGES };

const buildItemImageUrl = (itemImage, usedIndex) => {
  const n = (usedIndex % itemImage.count) + 1;
  const numStr = itemImage.pad ? String(n).padStart(itemImage.pad, '0') : String(n);
  return `/images/${itemImage.folder}/${itemImage.slug}-${numStr}.jpg`;
};

const generateMockProducts = (targetCount = 480) => {
  const products = [];
  // 품목마다 몇 번째 상품인지 센다. 그 품목의 사진을 순서대로 쓴다
  const itemImageIndex = {};

  for (let i = 0; i < targetCount; i++) {
    const base = baseProducts[i % baseProducts.length];
    const prefixIdx = Math.floor(i / baseProducts.length) % prefixes.length;
    const suffixIdx = Math.floor(i / (baseProducts.length * prefixes.length)) % suffixes.length;

    const idNum = String(i + 1).padStart(3, '0');
    const prefix = i >= baseProducts.length ? `${prefixes[prefixIdx]} ` : '';
    const suffix = i >= baseProducts.length * 2 ? ` (${suffixes[suffixIdx]})` : '';

    // 가격과 할인율에 규칙적인 다변화를 주어 현실적인 데이터 생성.
    // 처음 26개(P001~P026)는 기초값을 그대로 쓴다. P002 9,990원·15% 는 할인액이
    // 1,498.5원 → 1,498원이 되어 '원 단위 미만 버림'을 화면에서 보여 주는 상품이고, 문서의 금액
    // 기대값(P001 2개 + P002 1개 = 37,292원)이 이 값에 기댄다. P027 부터는 아래 식으로 바꾼다.
    const isBaseProduct = i < baseProducts.length;
    const priceVariation = ((i * 7) % 15) * 500;
    const price = isBaseProduct ? base.price : Math.max(3000, base.price + priceVariation);
    const discountPercent = isBaseProduct
      ? base.discountPercent
      : (base.discountPercent + (i % 4) * 5) % 35;

    let imageUrl = '';
    const itemImage = ITEM_IMAGES[base.name];
    if (itemImage) {
      const used = itemImageIndex[base.name] || 0;
      const sharedCatImage = SHARED_ITEM_CAT_IMAGES[base.name];
      if (sharedCatImage) {
        const imageSet = used % 2 === 0 ? sharedCatImage : itemImage;
        imageUrl = buildItemImageUrl(imageSet, Math.floor(used / 2));
      } else {
        imageUrl = buildItemImageUrl(itemImage, used);
      }
      itemImageIndex[base.name] = used + 1;
    }

    products.push({
      id: `P${idNum}`,
      name: `${prefix}${base.name}${suffix}`,
      petTypes: base.petTypes,
      categoryId: base.categoryId,
      price,
      discountPercent,
      imageUrl,
      description: base.description
    });
  }

  return products;
};

const mockProducts = generateMockProducts(480);

export { mockProducts };
