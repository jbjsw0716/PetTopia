import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ScrollButtons } from './components/ScrollButtons.jsx';
import { mockProductReviews } from './mocks/mockProductReviews.js';
import { RouteScroll } from './components/RouteScroll.jsx';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { FloatingAssistant } from './components/FloatingAssistant.jsx';
import { ConfirmArea } from './components/ConfirmArea.jsx';
import { mockCategories } from './mocks/mockCategories.js';
import { mockInquiries } from './mocks/mockInquiries.js';
import { mockPopularKeywords } from './mocks/mockPopularKeywords.js';
import { mockProducts } from './mocks/mockProducts.js';
import { mockReviews } from './mocks/mockReviews.js';
import { mockSitters } from './mocks/mockSitters.js';
import { mockServices } from './mocks/mockServices.js';
import { FREE_SHIPPING_MIN, MAX_QUANTITY, PET_TYPE_LABELS } from './utils/constants.js';
import { FAQ_CATEGORIES } from './utils/faqCategories.js';
import { createNextId } from './utils/ids.js';
import {
  formatWon,
  getCartAmounts,
  getDiscountAmount,
  getLineTotal,
  getReservationAmount
} from './utils/money.js';
import { normalizePhone } from './utils/phone.js';
import { getDateOnlyTime } from './utils/datetime.js';
import { getEndAt, getMaxReservationQuantity, getReservationErrors } from './utils/reservation.js';
import { checkMockData } from './utils/mockCheck.js';
import { getReviewBlockReason, getReviewInputErrors } from './utils/review.js';
import { createDefaultStore, isValidReviews, loadStore, saveStore } from './utils/storage.js';
import './Layout.css';

// 공유 상태와 변경 함수를 갖고 <Outlet context> 로 내려준다.

const ENABLED_MENUS = {
  dog: true,
  cat: true,
  sitter: true,
  promotion: true,
  support: true,
  wishlist: true,
  orders: true,
  mypage: true,
  cart: true
};

const ORDER_ID_PREFIX = 'O';
const ORDER_ID_DIGITS = 3;

const RESERVATION_ID_PREFIX = 'RS';
const RESERVATION_ID_DIGITS = 3;

const INQUIRY_ID_PREFIX = 'Q';
const INQUIRY_ID_DIGITS = 3;

const REVIEW_ID_PREFIX = 'RV';
const REVIEW_ID_DIGITS = 3;

// 상품 리뷰 번호는 RVP001 — 기획전 번호가 PR001~ 이라 머리글자를 나눴다.
// 펫시터 후기 RV 와 한 가족으로 읽힌다 — 'RV(후기) + P(상품)'.
const PRODUCT_REVIEW_ID_PREFIX = 'RVP';
const PRODUCT_REVIEW_ID_DIGITS = 3;

// 성공 문구는 여기 두지 않는다 — 변경 함수가 돌려주는 message 는 실패 안내다.
// 성공했을 때 무엇을 보여줄지는 동작을 실행한 화면이 정한다.
const LOAD_FAIL_MESSAGE = '저장 데이터를 불러오지 못했습니다.';
const SAVE_FAIL_MESSAGE = '변경 내용을 저장하지 못했습니다. 다시 시도해 주세요.';
const MAX_QUANTITY_MESSAGE = '합산 결과가 99 를 넘어 담지 못했습니다.';
const QUANTITY_MESSAGE = '수량은 1~99 의 정수로 입력해 주세요.';
const RESET_FAIL_MESSAGE = '초기화하지 못했습니다. 다시 시도해 주세요.';
const ORDER_SAVE_FAIL_MESSAGE = '주문을 저장하지 못했습니다. 다시 시도해 주세요.';
const EMPTY_TARGET_MESSAGE = '주문할 수 있는 상품이 없습니다.';
const PRODUCT_NOT_FOUND_MESSAGE = '상품을 찾을 수 없습니다.';
const NO_SELECTION_MESSAGE = '선택한 상품이 없습니다.';
const NO_ORDER_SELECTION_MESSAGE = '주문할 상품을 선택해 주세요.';
const UNAVAILABLE_IN_CART_MESSAGE = '구매할 수 없는 상품을 삭제한 뒤 주문해 주세요.';
const NO_DRAFT_MESSAGE = '주문 대상이 없습니다. 장바구니에서 다시 시작해 주세요.';
const SHIPPING_INVALID_MESSAGE = '배송 정보를 다시 확인해 주세요.';
const INQUIRY_INVALID_MESSAGE = '문의 내용을 다시 확인해 주세요.';
const INQUIRY_SAVE_FAIL_MESSAGE = '문의를 저장하지 못했습니다. 다시 시도해 주세요.';
const PROFILE_INVALID_MESSAGE = '내 정보를 다시 확인해 주세요.';
const PROFILE_SAVE_FAIL_MESSAGE = '내 정보를 저장하지 못했습니다. 다시 시도해 주세요.';
// 예약 검사 실패는 예약서 화면이 utils/reservation.js 로 이미 항목별로 보여준 뒤다.
// 여기서 다시 걸리는 것은 그사이(다른 탭 등) 조건이 달라졌다는 뜻이라 문구를 하나로 묶는다.
const RESERVATION_INVALID_MESSAGE = '예약 내용을 다시 확인해 주세요.';
const RESERVATION_SAVE_FAIL_MESSAGE = '예약을 저장하지 못했습니다. 다시 시도해 주세요.';
// 예약 취소 — 예약 상세 화면이 조건에 맞을 때만 버튼을 보여주지만, 그사이(탭을 오래 열어
// 둔 경우 등) 조건이 달라졌을 수 있어 여기서 다시 본다. 정상 흐름에서는 거의 뜨지 않는 방어용 문구다.
const CANCEL_INVALID_MESSAGE = '취소할 수 없는 예약입니다.';
const CANCEL_SAVE_FAIL_MESSAGE = '취소를 저장하지 못했습니다. 다시 시도해 주세요.';
// 주문 취소 — 위 CANCEL_INVALID_MESSAGE 는 문구가 예약 전용이라 따로 둔다.
// 저장 실패는 CANCEL_SAVE_FAIL_MESSAGE 를 예약과 같이 쓴다.
const ORDER_CANCEL_INVALID_MESSAGE = '취소할 수 없는 주문입니다.';
// 후기 — 후기 작성 화면이 진입할 때 조건과 입력을 이미 봤다. 여기서 다시 걸리는 것은
// 그사이(탭을 오래 열어 둔 사이 날짜가 넘어감 · 다른 탭에서 후기를 씀 등) 달라졌다는 뜻이다.
// 정상 흐름에서는 거의 뜨지 않는 방어용 문구다.
const REVIEW_UNAVAILABLE_MESSAGE = '후기를 쓸 수 없는 예약입니다.';
const REVIEW_INVALID_MESSAGE = '후기 내용을 다시 확인해 주세요.';
const REVIEW_SAVE_FAIL_MESSAGE = '후기를 저장하지 못했습니다. 다시 시도해 주세요.';
const PRODUCT_REVIEW_INVALID_MESSAGE =
  '별점과 후기 내용을 확인해주세요. 후기는 10~1,000자로 입력해주세요.';
const ORDER_CHANGED_MESSAGE =
  '주문 내용이 달라졌습니다. 장바구니에서 다시 확인해 주세요.';
// 지워지는 범위를 빠짐없이 적는다 — 상품 리뷰도 같은 저장 데이터에 있어 함께 지워진다.
const RESET_CONFIRM_MESSAGE =
  '장바구니 · 주문 · 예약 · 후기 · 문의 · 관심 상품 · 상품 리뷰 · 내 정보가 모두 지워지고 처음 상태로 돌아갑니다. 초기화할까요?';

// 헤더 맨 위 프로모션 띠의 문구. 상수에서 만들므로 기준 금액이 바뀌면 띠 문구도 따라 움직인다.
// 빈 문자열이면 Header 가 띠를 내보내지 않는다.
const PROMOTION_MESSAGE =
  formatWon(FREE_SHIPPING_MIN) + ' 이상 구매 시 무료배송';

// 기초 데이터(mock) 검사 — 앱이 처음 뜰 때 한 번만 한다.
// mock 은 실행 중에 바뀌지 않으므로 컴포넌트 밖에서 한 번 계산하면 된다. 어긋나면 담기·주문·예약을
// 막고 상품 목록·예약서가 안내한다. 저장 데이터 오류(storageStatus)와는 다른 값·다른 문구다.
const MOCK_DATA_STATUS = checkMockData().length === 0 ? 'ready' : 'error';
const MOCK_DATA_ERROR_MESSAGE = '기초 데이터에 오류가 있어 구매·예약을 진행할 수 없습니다.';

function Layout() {
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [previousPath, setPreviousPath] = useState(location.pathname);
  // 후기 등록 결과 안내 — 후기 작성에서 저장에 성공하면 예약 내역으로 이동해 결과를 안내한다.
  // 등록한 예약 번호를 들고 있다가 예약 내역이 띠로 보여 준다. 저장하지 않는 화면 상태라 새로고침하면
  // 사라지고, 예약 내역을 떠나면 아래에서 지운다 — 주문·예약 취소 띠와 같은 성격이다.
  const [reviewNoticeId, setReviewNoticeId] = useState(null);
  if (previousPath !== location.pathname) {
    setPreviousPath(location.pathname);
    if (previousPath === '/products' && location.pathname !== '/products') setAppliedSearch('');
    if (reviewNoticeId !== null && location.pathname !== '/reservations') setReviewNoticeId(null);
  }

  const [appliedPetType, setAppliedPetType] = useState('all');
  // 확정한 용품 분류. 헤더의 하위 메뉴와 상품 목록의 오른쪽 필터가 같은 값 하나를 본다 —
  // 필터를 URL 에 넣지 않기로 해서 공유 상태가 유일한 전달 경로다.
  const [appliedCategoryId, setAppliedCategoryId] = useState('all');
  // 상품 리뷰 화면(/product-reviews)의 동물 선택. 주소(?pet=)에 넣지 않고 여기 둔다 —
  // 필터를 URL 에 넣지 않는다는 규칙을 따른다. 새로고침하면 '전체'로 돌아간다(상품 목록과 같다).
  const [reviewPetType, setReviewPetType] = useState('all');
  const [lastResetKey, setLastResetKey] = useState(null);
  if (location.pathname === '/products' && location.search === '?reset=1' && lastResetKey !== location.key) {
    setLastResetKey(location.key);
    setAppliedSearch(''); setAppliedPetType('all'); setAppliedCategoryId('all');
  }

  // 무한 스크롤 화면이 다 불러왔는지. 그 밖의 화면에서는 늘 true 라 푸터가 항상 보인다.
  // 되돌리는 것은 무한 스크롤 화면이 떠날 때 한다.
  const [isListComplete, setListComplete] = useState(true);

  // 저장소를 한 번만 읽어 status 와 store 를 함께 정한다.
  // useState 초기화 함수에서 부르므로 첫 렌더 전에 끝난다 — loading 상태가 없는 이유는
  // storage.js loadStore 의 설명을 따른다.
  // 둘을 따로 두면 한 번 읽을 것을 두 번 읽게 되므로 한 객체에 담는다.
  const [storage, setStorage] = useState(() => loadStore());

  // 홈 첫 방문 팝업을 닫은 상태인가. 닫은 상태는 이번 접속 동안만 둔다 —
  // 새로고침하면 다시 뜬다(헤더 띠와 같은 방식). 홈 화면 안에 두면 홈에 돌아올 때마다 다시 떠서 여기 둔다.
  // 처음 값은 저장된 '오늘 하루 보지 않기'(promotionHiddenUntil, 그날 자정 일시)가 아직 살아 있는가다.
  // 저장 데이터를 읽은 직후 한 번만 본다 — 그리는 중에 지금 시각을 읽으면 그릴 때마다 결과가 달라진다.
  // 지난 일시는 지우지 않고 둔다. 팝업이 다시 뜰 뿐이다 (storage.js isValidPromotionHiddenUntil)
  const [isPromotionClosed, setPromotionClosed] = useState(
    () =>
      storage.store.promotionHiddenUntil !== null &&
      Date.parse(storage.store.promotionHiddenUntil) > Date.now()
  );

  // 복원에 실패했을 때만 제공하는 초기화. 자동으로 실행하지 않는다.
  const [isResetOpen, setResetOpen] = useState(false);
  const [resetError, setResetError] = useState(null);

  // 주문 초안 — 장바구니와 주문서가 함께 쓰는 일시적인 값이다.
  // 저장하지 않는다. 새로고침하면 사라지고 주문서가 `주문 대상 없음` 을 표시한다.
  // 주문 대상은 URL 에 담을 수 없는 값이라 주문서만 URL 로 복원할 수 없는 화면이다.
  const [checkoutDraft, setCheckoutDraft] = useState(null);

  const navigate = useNavigate();

  const cartItems = storage.store.cartItems;
  const wishlistProductIds = storage.store.wishlistProductIds;
  // 헤더의 장바구니 숫자는 항목 수가 아니라 수량의 합이다
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 상품 리뷰 전체 — 처음부터 있는 리뷰(mock)와 저장된 리뷰를 여기서 한 번만 합친다.
  // 평점·리뷰 수·평점순 정렬·리뷰 화면이 모두 이 배열 하나를 본다. Context 대신 Outlet context 로
  // 내려 주고, Outlet 밖에 떠 있는 도우미에는 props 로 넘긴다.
  const allProductReviews = [...mockProductReviews, ...storage.store.productReviews];

  function applySearch(keyword) {
    setAppliedSearch(keyword);
  }

  // 검색은 이동을 함께 하므로 Header 가 아니라 여기서 처리한다.
  function handleSearchSubmit(keyword) {
    const trimmed = keyword.trim();
    if (trimmed === '') {
      return;
    }
    setSearchInput(trimmed);
    applySearch(trimmed);
    setAppliedPetType('all');
    setAppliedCategoryId('all');
    navigate('/products');
  }

  // F-01 · F-03 헤더의 강아지·고양이. 적용 동물을 정하고 상품 목록으로 보낸다.
  // 필터는 URL 에 넣지 않으므로 여기 공유 상태가 전달 경로다.
  // 동물 메뉴 자체를 누르는 것이 곧 그 동물의 `전체보기` 다 — 분류를 all 로 되돌린다.
  function handlePetTypeSelect(petType) {
    applySearch('');
    setAppliedPetType(petType);
    setAppliedCategoryId('all');
    navigate('/products');
  }

  // F-03 헤더 하위 메뉴에서 용품 분류를 골랐다.
  // 적용 동물과 분류를 함께 정한다. 둘을 따로 정하면 그 사이에 어긋난 조건으로 한 번
  // 그려진다 — 동물만 먼저 바뀐 순간 분류가 아직 반대쪽 것이라 상품 목록의 "고른 분류가 지금
  // 동물 메뉴에 없으면 전체보기" 가 잘못 걸린다.
  function handleCategorySelect(petType, categoryId) {
    applySearch('');
    setAppliedPetType(petType);
    setAppliedCategoryId(categoryId);
    navigate('/products');
  }

  // 헤더 DOG·CAT 아래의 'Reviews'. 그 동물의 리뷰로 걸고 리뷰 화면으로 보낸다.
  // handlePetTypeSelect 와 같은 방식이다 — 주소 대신 공유 상태가 전달 경로다.
  function handleReviewPetSelect(petType) {
    setReviewPetType(petType);
    navigate('/product-reviews');
  }

  // 저장 순서를 한 곳에 모은다 — 다음 데이터 구성 → 저장 성공 → 확정 상태 갱신.
  // 안내와 이동은 부르는 화면이 한다.
  // 저장에 실패하면 setStorage 를 부르지 않는다. 기존 확정 상태와 기존 저장 데이터가 남는다.
  //
  // 수업의 useEffect 자동 저장을 쓰지 않는 이유가 이것이다 — 자동 저장은 실패를
  // 감지할 수 없어 "저장되지 않은 변경을 성공으로 안내하지 않는다" 를 지킬 수 없다.
  function commitStore(nextStore) {
    const result = saveStore(nextStore);
    if (!result.ok) {
      return { ok: false, message: SAVE_FAIL_MESSAGE };
    }
    setStorage({ status: 'ready', store: nextStore });
    return { ok: true, message: '' };
  }

  // F-31 관심 등록·해제.
  function toggleWishlist(productId) {
    if (storage.status !== 'ready') return { ok: false, message: LOAD_FAIL_MESSAGE };
    const isWished = wishlistProductIds.includes(productId);
    // 없는 상품은 새로 찜하는 것만 막는다. 이미 찜한 id 는 상품이 사라졌어도
    // 해제할 수 있어야 한다.
    if (!isWished && !mockProducts.some((product) => product.id === productId)) {
      return { ok: false, message: PRODUCT_NOT_FOUND_MESSAGE };
    }
    const nextWishlistProductIds = isWished
      ? wishlistProductIds.filter((id) => id !== productId)
      : [...wishlistProductIds, productId];
    return commitStore({ ...storage.store, wishlistProductIds: nextWishlistProductIds });
  }

  // F-06 장바구니 담기. 같은 productId 가 있으면 수량을 합산한다.
  function addToCart(productId, quantity) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }
    if (MOCK_DATA_STATUS !== 'ready') {
      return { ok: false, message: MOCK_DATA_ERROR_MESSAGE };
    }

    // 화면이 이미 검사했더라도 여기서 다시 본다.
    // 없는 상품이나 1~99 밖의 수량이 저장되면 저장은 성공해도 다음 새로고침의 복원 검사
    // (storage.js isValidCartItems)에 걸려 저장 데이터 전체를 읽지 못한다.
    if (!mockProducts.some((product) => product.id === productId)) {
      return { ok: false, message: PRODUCT_NOT_FOUND_MESSAGE };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { ok: false, message: QUANTITY_MESSAGE };
    }

    const existing = cartItems.find((item) => item.productId === productId);
    let nextCartItems;

    if (existing) {
      const nextQuantity = existing.quantity + quantity;
      if (nextQuantity > MAX_QUANTITY) {
        return { ok: false, message: MAX_QUANTITY_MESSAGE };
      }
      nextCartItems = cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: nextQuantity } : item
      );
    } else {
      nextCartItems = [...cartItems, { productId, quantity }];
    }

    return commitStore({ ...storage.store, cartItems: nextCartItems });
  }

  // F-08 장바구니 수량 변경.
  // 화면이 이미 범위를 검사했더라도 여기서 다시 본다.
  function updateCartQuantity(productId, quantity) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { ok: false, message: QUANTITY_MESSAGE };
    }

    const nextCartItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );

    return commitStore({ ...storage.store, cartItems: nextCartItems });
  }

  // F-09 장바구니 삭제. 확인을 받지 않는다 — 확인은 선택 삭제의 것이다.
  function removeCartItem(productId) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    const nextCartItems = cartItems.filter((item) => item.productId !== productId);

    return commitStore({ ...storage.store, cartItems: nextCartItems });
  }

  // F-32 선택 삭제. 고른 항목을 한꺼번에 빼고 한 번 저장한다.
  // 확인은 장바구니 화면이 받은 뒤에 부른다.
  // 저장에 실패하면 목록이 그대로 남는다 — 선택 상태는 화면이 그대로 둔다.
  function removeSelectedCartItems(productIds) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }
    // 화면이 버튼을 막지만 여기서도 본다
    if (productIds.length === 0) {
      return { ok: false, message: NO_SELECTION_MESSAGE };
    }

    const nextCartItems = cartItems.filter((item) => !productIds.includes(item.productId));

    return commitStore({ ...storage.store, cartItems: nextCartItems });
  }

  // 장바구니 항목을 ORDER_ITEM 모양으로 바꾼다.
  // 주문 시점의 값을 복사해 둔다 — 이후 가격·할인율이 달라지거나 상품이 사라져도
  // 주문 기록은 그대로 보인다.
  // mock 에 없는 상품은 구매 불가 항목이라 대상에서 뺀다. 0원 상품처럼 다루지 않는다.
  function buildOrderItems(productIds) {
    const items = [];

    for (const productId of productIds) {
      const cartItem = cartItems.find((item) => item.productId === productId);
      if (!cartItem) {
        continue;
      }

      const product = mockProducts.find((item) => item.id === productId);
      if (!product) {
        continue;
      }

      items.push({
        productId,
        name: product.name,
        unitPrice: product.price,
        discountPercent: product.discountPercent,
        discountAmount: getDiscountAmount(
          product.price,
          product.discountPercent,
          cartItem.quantity
        ),
        quantity: cartItem.quantity,
        lineTotal: getLineTotal(
          product.price,
          product.discountPercent,
          cartItem.quantity
        )
      });
    }

    return items;
  }

  // 두 배열은 같은 productId 순서로 만들어지므로 자리끼리 비교한다.
  function isSameOrderItems(draftItems, currentItems) {
    if (draftItems.length !== currentItems.length) {
      return false;
    }

    for (let index = 0; index < draftItems.length; index = index + 1) {
      const draftItem = draftItems[index];
      const currentItem = currentItems[index];

      if (draftItem.productId !== currentItem.productId) {
        return false;
      }
      if (draftItem.name !== currentItem.name) {
        return false;
      }
      if (draftItem.unitPrice !== currentItem.unitPrice) {
        return false;
      }
      if (draftItem.discountPercent !== currentItem.discountPercent) {
        return false;
      }
      if (draftItem.quantity !== currentItem.quantity) {
        return false;
      }
      if (draftItem.discountAmount !== currentItem.discountAmount) {
        return false;
      }
      if (draftItem.lineTotal !== currentItem.lineTotal) {
        return false;
      }
    }

    return true;
  }

  // F-10 주문서 확인 — 주문 대상을 확정해 초안을 만든다.
  // 저장하지 않는다. 화면 이동은 부르는 쪽(장바구니)이 ok 를 보고 한다.
  // F-33 선택 주문 — 화면이 고른 상품 번호만 넘긴다. 금액·배송비도 고른 상품으로
  // 낸다. 주문을 마치면 주문한 항목만 장바구니에서 빠진다 (placeOrder).
  function prepareCheckout(productIds) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }
    if (MOCK_DATA_STATUS !== 'ready') {
      return { ok: false, message: MOCK_DATA_ERROR_MESSAGE };
    }

    // 구매할 수 없는 상품(mock 에 없는 productId)이 하나라도 장바구니에 있으면 주문을 막는다.
    // 고른 상품에 없더라도 막는다 — 그 줄을 지우면 주문할 수 있다고 장바구니가 안내한다.
    const hasUnavailableItem = cartItems.some(
      (item) => !mockProducts.some((product) => product.id === item.productId)
    );
    if (hasUnavailableItem) {
      return { ok: false, message: UNAVAILABLE_IN_CART_MESSAGE };
    }

    if (productIds.length === 0) {
      return { ok: false, message: NO_ORDER_SELECTION_MESSAGE };
    }

    const items = buildOrderItems(productIds);

    if (items.length === 0) {
      return { ok: false, message: EMPTY_TARGET_MESSAGE };
    }

    const amounts = getCartAmounts(items);

    setCheckoutDraft({
      // 이번 제출을 식별할 후보 번호다. 여기서 한 번 만들고 재시도 때도 같은 것을 쓴다
      orderId: createNextId(storage.store.orders, ORDER_ID_PREFIX, ORDER_ID_DIGITS),
      items,
      subtotal: amounts.subtotal,
      discountTotal: amounts.discountTotal,
      shippingFee: amounts.shippingFee,
      totalAmount: amounts.totalAmount
    });

    return { ok: true, message: '' };
  }

  // F-12 주문 완료.
  function placeOrder(draft, shippingInput) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }
    if (MOCK_DATA_STATUS !== 'ready') {
      return { ok: false, message: MOCK_DATA_ERROR_MESSAGE };
    }
    if (!draft) {
      return { ok: false, message: NO_DRAFT_MESSAGE };
    }

    // 같은 번호가 이미 있으면 주문을 다시 만들지 않는다.
    // 이때는 그 주문이 이미 저장돼 있다는 뜻이라 실패가 아니다 — 완료 화면으로 보낸다.
    // "완료 화면에 다시 들어와도 주문이 또 생기지 않는다"를 여기서도 지킨다.
    // 중복 제출의 실제 방어선은 isSubmitting 이 아니라 이 검사와, 다음 저장 데이터를
    // 하나의 확정 상태에서 통째로 만들어 쓰는 방식이다.
    if (storage.store.orders.some((order) => order.id === draft.orderId)) {
      setCheckoutDraft(null);
      return { ok: true, message: '', orderId: draft.orderId };
    }

    // 화면이 이미 검사했더라도 여기서 다시 본다.
    // 정규화는 저장하는 쪽에서 한 번만 한다 — 화면마다 표시가 달라지지 않게.
    const recipientName = shippingInput.recipientName.trim();
    const address = shippingInput.address.trim();
    const phone = normalizePhone(shippingInput.phone);

    if (recipientName === '' || address === '' || phone === null) {
      return { ok: false, message: SHIPPING_INVALID_MESSAGE };
    }

    // 저장 직전에 현재 상품·장바구니와 초안을 다시 비교한다.
    // 초안을 만든 뒤 다른 탭에서 장바구니가 바뀌었을 수 있다. 다르면 주문하지 않는다.
    const currentItems = buildOrderItems(
      draft.items.map((item) => item.productId)
    );
    if (!isSameOrderItems(draft.items, currentItems)) {
      return { ok: false, message: ORDER_CHANGED_MESSAGE };
    }

    const amounts = getCartAmounts(currentItems);
    if (
      amounts.subtotal !== draft.subtotal ||
      amounts.discountTotal !== draft.discountTotal ||
      amounts.shippingFee !== draft.shippingFee ||
      amounts.totalAmount !== draft.totalAmount
    ) {
      return { ok: false, message: ORDER_CHANGED_MESSAGE };
    }

    const order = {
      id: draft.orderId,
      // 시간대를 포함한 ISO 8601. toISOString 의 끝 Z 가 시간대다
      orderedAt: new Date().toISOString(),
      status: 'COMPLETED',
      items: draft.items,
      shipping: { recipientName, phone, address },
      subtotal: draft.subtotal,
      discountTotal: draft.discountTotal,
      // 주문 시점 배송비를 저장하고 이후에 다시 계산하지 않는다
      shippingFee: draft.shippingFee,
      totalAmount: draft.totalAmount,
      cancelledAt: null
    };

    // 주문 추가와 장바구니 정리를 한 객체로 만들어 한 번 저장한다.
    // 나눠 저장하면 주문은 생겼는데 장바구니가 그대로인 상태가 생긴다.
    const orderedIds = draft.items.map((item) => item.productId);
    const result = commitStore({
      ...storage.store,
      orders: [...storage.store.orders, order],
      cartItems: cartItems.filter((item) => !orderedIds.includes(item.productId))
    });

    if (!result.ok) {
      return { ok: false, message: ORDER_SAVE_FAIL_MESSAGE };
    }

    // 성공하면 초안을 지운다. 완료 화면에서 되돌아와도 다시 제출할 수 없다
    setCheckoutDraft(null);
    return { ok: true, message: '', orderId: order.id };
  }

  // F-19~F-21 예약 등록. 예약서 화면(ReservationPage)이 검사 1(필수 값)을 이미 항목별로
  // 보여준 뒤 제출한다. 검사 2~4(선택 가능 기간·이용 가능 시간·중복)는 화면과 여기가
  // utils/reservation.js 의 getReservationErrors 하나로 같이 쓴다 — 같은 계산이 두 곳에
  // 생기면 갈라진다.
  function addReservation(input) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }
    if (MOCK_DATA_STATUS !== 'ready') {
      return { ok: false, message: MOCK_DATA_ERROR_MESSAGE };
    }

    const sitter = mockSitters.find((item) => item.id === input.sitterId);
    const sitterService = sitter
      ? sitter.services.find((item) => item.serviceId === input.serviceId)
      : null;
    const service = mockServices.find((item) => item.id === input.serviceId);

    if (!sitter || !sitterService || !service) {
      return { ok: false, message: RESERVATION_INVALID_MESSAGE };
    }

    // 화면이 이미 검사했더라도 여기서 다시 본다.
    const petName = input.pet.name.trim();
    const petAge = String(input.pet.age).trim();
    const quantity = Number(input.quantity);

    if (
      petName === '' ||
      !Object.hasOwn(PET_TYPE_LABELS, input.pet.petType) ||
      !/^[0-9]+$/.test(petAge) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > getMaxReservationQuantity(service.id)
    ) {
      return { ok: false, message: RESERVATION_INVALID_MESSAGE };
    }

    // 그 서비스의 대상 동물인가 — 산책·데이케어는 강아지만이다 (mockServices petTypes).
    // 화면이 무엇을 고르게 하든 저장 직전에 여기서 다시 본다
    if (!service.petTypes.includes(input.pet.petType)) {
      return { ok: false, message: RESERVATION_INVALID_MESSAGE };
    }

    const endAt = getEndAt(input.startAt, quantity, service.durationMinutes);
    // 같은 펫시터 + 취소 아님만 중복 판정에 넣는다 — 취소된 예약은 그 시간이 다시 빈다
    const sitterReservations = storage.store.reservations.filter(
      (reservation) => reservation.sitterId === sitter.id && reservation.status === 'COMPLETED'
    );
    const errors = getReservationErrors({
      serviceId: service.id,
      sitterReservations,
      startAt: input.startAt,
      endAt,
      availableHours: sitter.availableHours
    });

    if (errors.length > 0) {
      return { ok: false, message: RESERVATION_INVALID_MESSAGE };
    }

    const reservation = {
      id: createNextId(storage.store.reservations, RESERVATION_ID_PREFIX, RESERVATION_ID_DIGITS),
      reservedAt: new Date().toISOString(),
      status: 'COMPLETED',
      sitterId: sitter.id,
      // 예약 시점의 값을 복사해 둔다 — 이후 펫시터 정보·요금이 달라져도 예약 기록은
      // 그대로 보인다 (주문의 원가 보존과 같은 이유)
      sitterName: sitter.name,
      serviceId: service.id,
      serviceName: service.name,
      unitPrice: sitterService.price,
      unit: service.unit,
      unitLabel: service.unitLabel,
      quantity,
      // 금액 계산식은 money.js 한 곳이다 — 예약서 화면의 예상 금액과 같은 함수다
      totalAmount: getReservationAmount(sitterService.price, quantity),
      startAt: input.startAt,
      endAt,
      pet: {
        name: petName,
        petType: input.pet.petType,
        age: Number(petAge),
        note: input.pet.note.trim()
      },
      cancelledAt: null
    };

    const result = commitStore({
      ...storage.store,
      reservations: [...storage.store.reservations, reservation]
    });

    if (!result.ok) {
      return { ok: false, message: RESERVATION_SAVE_FAIL_MESSAGE };
    }

    return { ok: true, message: '', reservationId: reservation.id };
  }

  // F-40 예약 취소.
  // 취소 가능 조건(상태 COMPLETED + 시작 일시의 날짜가 오늘보다 뒤)을 화면이 이미 봤더라도
  // 여기서 다시 판정한다 — 확인을 누르는 사이 날짜가 넘어갈 수 있어서다.
  // 기록은 지우지 않는다. status 만 CANCELLED 로 바꾸고 cancelledAt 을 남긴다.
  function cancelReservation(reservationId) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    const reservation = storage.store.reservations.find((item) => item.id === reservationId);
    const isCancellable =
      reservation &&
      reservation.status === 'COMPLETED' &&
      getDateOnlyTime(reservation.startAt) > getDateOnlyTime(new Date().toISOString());

    if (!isCancellable) {
      return { ok: false, message: CANCEL_INVALID_MESSAGE };
    }

    const nextReservations = storage.store.reservations.map((item) =>
      item.id === reservationId
        ? { ...item, status: 'CANCELLED', cancelledAt: new Date().toISOString() }
        : item
    );

    const result = commitStore({ ...storage.store, reservations: nextReservations });

    if (!result.ok) {
      return { ok: false, message: CANCEL_SAVE_FAIL_MESSAGE };
    }

    return { ok: true, message: '' };
  }

  // F-40 주문 취소.
  // 주문은 상태가 COMPLETED 이면 언제든 취소할 수 있다 — 예약과 달리 날짜 조건이 없다.
  // 주문 상세 화면이 버튼을 보였더라도 다른 탭에서 이미 취소했을 수 있어 여기서 다시 본다.
  // 기록은 지우지 않는다. status 와 cancelledAt 만 바꾸고 상품·배송·금액은 그대로 둔다.
  // 장바구니로 되돌리지 않는다 — cartItems 를 건드리지 않는다.
  function cancelOrder(orderId) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    const order = storage.store.orders.find((item) => item.id === orderId);

    if (!order || order.status !== 'COMPLETED') {
      return { ok: false, message: ORDER_CANCEL_INVALID_MESSAGE };
    }

    // 취소 일시가 주문 일시보다 이르면 저장은 성공해도 다음 새로고침의 복원 검사
    // (storage.js — 주문보다 앞선 취소 일시는 있을 수 없다)에 걸려 저장 데이터 전체를 읽지 못한다.
    // 시스템 시계가 주문 뒤에 거꾸로 돌아간 경우에만 생긴다. 그때는 주문 일시로 맞춘다.
    const now = new Date().toISOString();
    const cancelledAt = Date.parse(now) < Date.parse(order.orderedAt) ? order.orderedAt : now;

    // status 와 cancelledAt 은 한 객체 안에서 같이 바꾼다 — 둘이 어긋나도 복원에 실패한다
    const nextOrders = storage.store.orders.map((item) =>
      item.id === orderId ? { ...item, status: 'CANCELLED', cancelledAt } : item
    );

    const result = commitStore({ ...storage.store, orders: nextOrders });

    if (!result.ok) {
      return { ok: false, message: CANCEL_SAVE_FAIL_MESSAGE };
    }

    return { ok: true, message: '' };
  }

  // F-25 후기 작성.
  // 작성 조건(예약 완료 · 종료 일시의 날짜가 오늘보다 이전 · 그 예약의 후기 없음)과 입력 검사는
  // utils/review.js 하나로 예약 내역 · 마이페이지 · 후기 작성 화면과 같이 쓴다.
  function addReview(input) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    const reservation = storage.store.reservations.find(
      (item) => item.id === input.reservationId
    );
    const blockReason = getReviewBlockReason(
      reservation,
      storage.store.reviews,
      new Date().toISOString()
    );

    if (blockReason !== null) {
      return { ok: false, message: REVIEW_UNAVAILABLE_MESSAGE };
    }

    if (Object.keys(getReviewInputErrors(input.rating, input.content)).length > 0) {
      return { ok: false, message: REVIEW_INVALID_MESSAGE };
    }

    // mockReviews 와 같은 여덟 키 · 같은 순서다. 이용 후기 · 펫시터 상세 · 평점이 sitterId ·
    // serviceId · petType 으로 거르고 세므로, 이 셋은 예약에 저장된 시점 값을 복사한다.
    // 번호는 mock 초기 후기까지 포함해서 정한다. 저장된 것만 보면 RV001 부터 다시 시작해
    // mock 의 RV001 과 겹친다 (addInquiry 와 같은 이유)
    const review = {
      id: createNextId([...mockReviews, ...storage.store.reviews], REVIEW_ID_PREFIX, REVIEW_ID_DIGITS),
      reservationId: reservation.id,
      sitterId: reservation.sitterId,
      serviceId: reservation.serviceId,
      rating: input.rating,
      content: input.content.trim(),
      writtenAt: new Date().toISOString(),
      petType: reservation.pet?.petType
    };
    const nextReviews = [...storage.store.reviews, review];

    // 저장 전에 복원 검사와 같은 구조 검사를 한 번 더 한다. reservations 의 복원 검사는
    // sitterId · serviceId · pet 을 보지 않아 이 값이 빠진 예약이 있을 수 있고, 그대로 저장하면
    // 저장은 성공해도 새로고침 뒤 저장 데이터 전체가 복원 실패가 된다 (storage.js isValidReviews)
    if (!isValidReviews(nextReviews)) {
      return { ok: false, message: REVIEW_UNAVAILABLE_MESSAGE };
    }

    const result = commitStore({ ...storage.store, reviews: nextReviews });

    if (!result.ok) {
      return { ok: false, message: REVIEW_SAVE_FAIL_MESSAGE };
    }

    // 저장에 성공했을 때만 예약 내역의 결과 안내를 켠다 (저장 성공 → 확정 상태 → 안내·이동 순서)
    setReviewNoticeId(review.reservationId);
    return { ok: true, message: '', reviewId: review.id };
  }

  // 상품 리뷰 작성. 화면이 이미 검사했더라도 여기서 다시 본다.
  // 번호는 저장된 리뷰만 보고 정한다. 처음부터 있는 리뷰('RVP-DEMO-P001-1')는 머리글자 뒤가
  // 숫자가 아니라 createNextId 가 건너뛰므로, 넣어도 결과가 같다 — 펫시터 후기·문의와 다른 점이다.
  function addProductReview({ productId, rating, content }) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    const text = content.trim();
    if (
      !mockProducts.some((item) => item.id === productId) ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      text.length < 10 ||
      text.length > 1000
    ) {
      return { ok: false, message: PRODUCT_REVIEW_INVALID_MESSAGE };
    }

    const review = {
      id: createNextId(
        storage.store.productReviews,
        PRODUCT_REVIEW_ID_PREFIX,
        PRODUCT_REVIEW_ID_DIGITS
      ),
      productId,
      rating,
      content: text,
      author: storage.store.profile.name,
      writtenAt: new Date().toISOString()
    };

    return commitStore({
      ...storage.store,
      productReviews: [...storage.store.productReviews, review]
    });
  }

  // F-29 1:1 문의 등록. 화면이 이미 검사했더라도 여기서 다시 본다.
  // 새 문의는 항상 RECEIVED 이고 답변은 null 이다 — 서버가 없어 답변이 달릴 수 없다.
  function addInquiry(input) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    const title = input.title.trim();
    const content = input.content.trim();
    const isValidCategory = FAQ_CATEGORIES.some(
      (category) => category.id === input.faqCategoryId
    );

    if (
      !isValidCategory ||
      title.length < 1 ||
      title.length > 50 ||
      content.length < 10 ||
      content.length > 1000
    ) {
      return { ok: false, message: INQUIRY_INVALID_MESSAGE };
    }

    // 번호는 mock 초기 문의까지 포함해서 정한다. 저장된 것만 보면 Q001 부터 다시 시작해
    // mock 의 Q001 과 겹친다 (createNextId 는 배열 안의 가장 큰 번호 + 1 이다)
    const inquiry = {
      id: createNextId(
        [...mockInquiries, ...storage.store.inquiries],
        INQUIRY_ID_PREFIX,
        INQUIRY_ID_DIGITS
      ),
      productId: mockProducts.some((item) => item.id === input.productId) ? input.productId : null,
      faqCategoryId: input.faqCategoryId,
      title,
      content,
      createdAt: new Date().toISOString(),
      status: 'RECEIVED',
      answer: null,
      answeredAt: null
    };

    const result = commitStore({
      ...storage.store,
      inquiries: [...storage.store.inquiries, inquiry]
    });

    if (!result.ok) {
      return { ok: false, message: INQUIRY_SAVE_FAIL_MESSAGE };
    }

    return { ok: true, message: '', inquiryId: inquiry.id };
  }

  // F-30 프로필 수정. 화면이 이미 검사했더라도 여기서 다시 본다.
  // 저장 데이터를 읽지 못한 상태에서는 저장하지 않는다 — 저장하면 읽지 못한 기존 데이터를 덮어쓴다.
  // 연락처는 배송 정보와 같은 규칙으로 검사하고 010-0000-0000 으로 정규화해 저장한다.
  // 프로필은 기본값의 출처일 뿐이라 과거 주문·예약의 값은 바뀌지 않는다.
  function updateProfile(input) {
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    const name = input.name.trim();
    const address = input.address.trim();
    const phone = normalizePhone(input.phone);
    const petName = input.pet.name.trim();
    const petAge = input.pet.age.trim();

    // 나이는 0 이상의 정수다. 특이사항은 빈 문자열을 허용한다
    if (
      name === '' ||
      address === '' ||
      phone === null ||
      petName === '' ||
      !Object.hasOwn(PET_TYPE_LABELS, input.pet.petType) ||
      !/^[0-9]+$/.test(petAge)
    ) {
      return { ok: false, message: PROFILE_INVALID_MESSAGE };
    }

    const profile = {
      name,
      phone,
      address,
      pet: {
        name: petName,
        petType: input.pet.petType,
        age: Number(petAge),
        note: input.pet.note.trim()
      }
    };

    const result = commitStore({ ...storage.store, profile });

    if (!result.ok) {
      return { ok: false, message: PROFILE_SAVE_FAIL_MESSAGE };
    }

    return { ok: true, message: '', profile };
  }

  // 홈 팝업 닫기. '오늘 하루 보지 않기' 를 골랐으면 그날 자정 일시를 저장한다.
  // 저장 순서는 다른 변경 함수와 같다 — 저장에 성공한 뒤에만 닫힌 상태로 바꾼다.
  // 실패하면 팝업이 열린 채 남고 팝업이 이유를 안내한다. 저장하지 못한 채 닫으면 '오늘 하루' 를
  // 고른 사람에게 새로고침 뒤 팝업이 다시 떠서, 저장되지 않은 것을 된 것처럼 보이게 된다.
  function handleClosePromotionPopup(hideToday) {
    if (!hideToday) {
      setPromotionClosed(true);
      return { ok: true, message: '' };
    }
    if (storage.status !== 'ready') {
      return { ok: false, message: LOAD_FAIL_MESSAGE };
    }

    // 오늘 밤 자정 — 이 기기의 시간대 기준이다. setHours(24) 는 다음 날 0시가 된다
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const result = commitStore({
      ...storage.store,
      promotionHiddenUntil: midnight.toISOString()
    });
    if (!result.ok) {
      return result;
    }

    setPromotionClosed(true);
    return { ok: true, message: '' };
  }

  // F-14 초기화 — 삭제 범위 설명 → 사용자 확인 → pettopia.store.v1 에만 저장 → 실패하면 성공으로 안내하지 않는다.
  // 확인 전에 덮어쓰지 않는다. 이 함수는 사용자가 확인을 누른 뒤에만 불린다.
  function handleResetConfirm() {
    const result = commitStore(createDefaultStore());
    if (!result.ok) {
      setResetError(RESET_FAIL_MESSAGE);
      return;
    }
    setResetOpen(false);
    setResetError(null);
  }

  function handleResetCancel() {
    setResetOpen(false);
    setResetError(null);
  }

  return (
    <><RouteScroll /><div className="layout">
      <Header
        userName={storage.status === 'error' ? '' : storage.store.profile?.name || ''}
        cartCount={cartCount}
        searchInput={searchInput}
        popularKeywords={mockPopularKeywords}
        enabledMenus={ENABLED_MENUS}
        categories={mockCategories}
        promotionMessage={PROMOTION_MESSAGE}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onPopularKeywordSelect={handleSearchSubmit}
        onPetTypeSelect={handlePetTypeSelect}
        onCategorySelect={handleCategorySelect}
        onReviewPetSelect={handleReviewPetSelect}
      />

      {/* 저장 데이터 상태 안내 자리 — 공통 UI 가 아니라 이 파일이 갖는다.
          데이터가 없는 경우와 구분되는 문구다 — 빈 장바구니는 장바구니 화면이 따로 안내한다 */}
      {storage.status === 'error' ? (
        <div className="layout-storage-error" role="alert">
          <p className="layout-storage-error-message">
            {LOAD_FAIL_MESSAGE} 저장이 필요한 동작은 잠시 사용할 수 없습니다.
          </p>

          {isResetOpen ? (
            /* isSubmitting 을 넘기지 않는다 — localStorage 저장은 기다리는 구간이 없어
              '처리 중' 이 화면에 닿지 않는다. 같은 값을 다시 쓰는 것이라 두 번 눌러도
              결과가 같다 */
            <ConfirmArea
              isOpen={isResetOpen}
              message={RESET_CONFIRM_MESSAGE}
              confirmLabel="초기화"
              onConfirm={handleResetConfirm}
              onCancel={handleResetCancel}
            />
          ) : (
            <button
              type="button"
              className="layout-storage-error-action"
              onClick={() => setResetOpen(true)}
            >
              저장 데이터 초기화
            </button>
          )}

          {resetError ? (
            <p className="layout-storage-error-save">{resetError}</p>
          ) : null}
        </div>
      ) : null}

      <main className="layout-main">
        <Outlet key={location.pathname + (location.pathname === '/products' ? location.key : '')}
          context={{
            appliedSearch,
            appliedPetType,
            appliedCategoryId,
            applySearch,
            setAppliedPetType,
            setAppliedCategoryId,
            setListComplete,
            cartItems,
            wishlistProductIds,
            toggleWishlist,
            orders: storage.store.orders,
            reservations: storage.store.reservations,
            reviews: storage.store.reviews,
            inquiries: storage.store.inquiries,
            profile: storage.store.profile,
            checkoutDraft,
            storageStatus: storage.status,
            mockDataStatus: MOCK_DATA_STATUS,
            addToCart,
            updateCartQuantity,
            removeCartItem,
            removeSelectedCartItems,
            prepareCheckout,
            placeOrder,
            addReservation,
            cancelReservation,
            cancelOrder,
            addReview,
            reviewNoticeId,
            addInquiry,
            updateProfile,
            allProductReviews,
            addProductReview,
            reviewPetType,
            setReviewPetType,
            isPromotionPopupOpen: !isPromotionClosed,
            closePromotionPopup: handleClosePromotionPopup
          }}
        />
      </main>

      {/* 무한 스크롤 화면에서는 다 불러온 뒤에만 보인다. 0건·불러오기 실패도
          더 불러올 것이 없는 상태라 푸터를 표시한다.
          헤더와 같은 ENABLED_MENUS 를 넘긴다 — 푸터의 고객센터 항목도 support 에 딸린다 */}
      {isListComplete ? <Footer enabledMenus={ENABLED_MENUS} /> : null}
      {/* <Outlet> 밖이라 useOutletContext 가 닿지 않는다 — 상품 카드 평점에 쓸 리뷰 목록을 props 로 넘긴다 */}
      <FloatingAssistant allProductReviews={allProductReviews} />
      <ScrollButtons />
    </div></>
  );
}

export { Layout };
