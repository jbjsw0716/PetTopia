import { useState, useLayoutEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { HeaderIcon } from './HeaderIcon.jsx';
import { HeaderSearch } from './HeaderSearch.jsx';
import './Header.css';

// 영문 표시는 UI에만 적용하고 필터 ID는 유지한다.
const CATEGORY_LABELS = {
  FOOD: 'Food', SNACK: 'Treats', TOY: 'Toys', HYGIENE: 'Hygiene',
  OUTDOOR: 'Clothing & Outdoor', LITTER: 'Litter & Toilets', TOWER: 'Trees & Scratchers'
};
const MAIN_MENUS = [
  { key: 'dog', label: 'DOG', petType: 'DOG' },
  { key: 'cat', label: 'CAT', petType: 'CAT' },
  { key: 'sitter', label: 'PET SITTER', to: '/sitters', links: [
    { label: 'Find a Sitter', to: '/sitters' },
    { label: 'Care Guide', to: '/services' },
    { label: 'Reviews', to: '/reviews' }
  ] },
  { key: 'promotion', label: 'PROMOTION', to: '/promotions', links: [
    { label: 'Special Offers', to: '/promotions' }
  ] },
  { key: 'support', label: 'SUPPORT', to: '/notices', links: [
    { label: 'Notice', to: '/notices' },
    { label: 'FAQ', to: '/faq' },
    { label: '1:1 Inquiry', to: '/inquiries' }
  ] }
];
// key 는 그 화면을 켜는 enabledMenus 의 키다. 키가 꺼지면 링크도 함께 나오지 않는다.
const ACCOUNT_LINKS = [
  { key: 'mypage', label: 'My Page', to: '/mypage' },
  { key: 'orders', label: 'Orders', to: '/orders' },
  { key: 'sitter', label: 'Reservations', to: '/reservations' },
  { key: 'wishlist', label: 'Wishlist', to: '/wishlist' },
  { key: 'support', label: 'My Inquiries', to: '/inquiries' }
];

function Header({
  cartCount = 0, searchInput = '', popularKeywords = [], enabledMenus = {},
  categories = [], promotionMessage = '', userName = '',
  onSearchInputChange = () => {}, onSearchSubmit = () => {},
  onPopularKeywordSelect = () => {}, onPetTypeSelect = () => {}, onCategorySelect = () => {},
  onReviewPetSelect = () => {}
}) {
  const headerRef = useRef(null);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', `${headerRef.current?.getBoundingClientRect().height || 0}px`));
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isBandClosed, setBandClosed] = useState(false);
  const visibleMenus = MAIN_MENUS.filter((menu) => enabledMenus[menu.key]);

  function handleCloseMenus() {
    setMenuOpen(false);
    setOpenMenuKey(null);
  }

  function groupEvents(key) {
    return {
      onMouseEnter: () => {
        if (window.matchMedia('(min-width: 1151px) and (hover: hover)').matches) setOpenMenuKey(key);
      },
      onMouseLeave: () => setOpenMenuKey(null),
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenuKey(null);
      },
      onKeyDown: (event) => {
        if (event.key === 'Escape') {
          setOpenMenuKey(null);
          event.currentTarget.querySelector('button, a')?.focus();
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setOpenMenuKey(key);
        }
      }
    };
  }

  function toggleSubmenu(key) {
    const isHoverMenu = window.matchMedia('(min-width: 1151px) and (hover: hover)').matches;
    setOpenMenuKey(isHoverMenu || openMenuKey !== key ? key : null);
  }

  function submenuToggle(key, label) {
    return <button type="button" className="site-header-submenu-toggle" aria-label={`${label} 하위 메뉴`} aria-expanded={openMenuKey === key} aria-controls={`header-submenu-${key}`} onClick={() => toggleSubmenu(key)}><HeaderIcon name="chevron" /></button>;
  }

  return (
    <header ref={headerRef} className="site-header">
      {promotionMessage && !isBandClosed && <div className="site-header-band"><div className="site-header-band-inner"><p>{promotionMessage}</p><button type="button" onClick={() => setBandClosed(true)} aria-label="안내 닫기"><HeaderIcon name="close" /></button></div></div>}
      <div className="site-header-inner">
        <div className="site-header-top">
          <button type="button" className="site-header-nav-toggle" aria-label="메뉴" aria-expanded={isMenuOpen} aria-controls="site-header-menu" onClick={() => { setMenuOpen(!isMenuOpen); setOpenMenuKey(null); }}><HeaderIcon name={isMenuOpen ? 'close' : 'menu'} /></button>
          <NavLink to="/" end className="site-header-logo" aria-label="펫토피아 홈" onClick={handleCloseMenus}>pet<span>topia</span><i aria-hidden="true">.</i></NavLink>
          <nav id="site-header-menu" aria-label="주 메뉴" className={`site-header-menu${isMenuOpen ? ' is-open' : ''}`}>
            {visibleMenus.map((menu) => (
              <div className="site-header-menu-group" key={menu.key} {...groupEvents(menu.key)}>
                <div className="site-header-menu-row">
                  {menu.petType ? <button type="button" className="site-header-menu-item" onClick={() => { handleCloseMenus(); onPetTypeSelect(menu.petType); }}>{menu.label}</button>
                    : menu.to ? <NavLink to={menu.to} className="site-header-menu-item" onClick={handleCloseMenus}>{menu.label}</NavLink>
                      : <button type="button" className="site-header-menu-item" aria-expanded={openMenuKey === menu.key} aria-controls={`header-submenu-${menu.key}`} onClick={() => toggleSubmenu(menu.key)}>{menu.label}</button>}
                  {submenuToggle(menu.key, menu.label)}
                </div>
                <div id={`header-submenu-${menu.key}`} className="site-header-submenu" hidden={openMenuKey !== menu.key}>
                  {menu.petType ? <>
                    <button type="button" onClick={() => { handleCloseMenus(); onCategorySelect(menu.petType, 'all'); }}>Shop All</button>
                    {categories.filter((category) => category.petTypes.includes(menu.petType)).map((category) => <button type="button" key={category.id} onClick={() => { handleCloseMenus(); onCategorySelect(menu.petType, category.id); }}>{CATEGORY_LABELS[category.id] || category.name}</button>)}
                    {/* 리뷰 화면의 동물 선택은 주소(?pet=)가 아니라 Layout 의 공유 상태로 넘긴다 */}
                    <button type="button" onClick={() => { handleCloseMenus(); onReviewPetSelect(menu.petType); }}>Reviews</button>
                  </> : menu.links.map((link) => link.upcoming
                    ? <span className="site-header-upcoming" key={link.label}>{link.label}<small>Coming soon</small></span>
                    : <NavLink key={link.to} to={link.to} onClick={handleCloseMenus}>{link.label}</NavLink>)}
                </div>
              </div>
            ))}
          </nav>
          <div className="site-header-util">
            <button type="button" className="site-header-icon" aria-label="검색" title="Search" aria-haspopup="dialog" aria-expanded={isSearchOpen} onClick={() => { handleCloseMenus(); onSearchInputChange(''); setSearchOpen(true); }}><HeaderIcon name="search" /></button>
            {enabledMenus.wishlist && <NavLink to="/wishlist" className="site-header-icon" aria-label="좋아요" title="Wishlist" onClick={handleCloseMenus}><HeaderIcon name="heart" /></NavLink>}
            {enabledMenus.cart && <NavLink to="/cart" className="site-header-icon site-header-cart" aria-label={`장바구니 ${cartCount}개`} title="Cart" onClick={handleCloseMenus}><HeaderIcon name="cart" /><span className="site-header-cart-count" aria-hidden="true">{cartCount}</span></NavLink>}
            {enabledMenus.mypage && <div className="site-header-account" {...groupEvents('account')}>
              <div className="site-header-menu-row"><NavLink to="/mypage" className="site-header-icon" aria-label="마이페이지" title="My Page" onClick={handleCloseMenus}><HeaderIcon name="user" /></NavLink>{submenuToggle('account', 'My Page')}</div>
              <div id="header-submenu-account" className="site-header-submenu site-header-account-menu" hidden={openMenuKey !== 'account'}>{ACCOUNT_LINKS.filter((link) => enabledMenus[link.key]).map((link) => <NavLink key={link.to} to={link.to} onClick={handleCloseMenus}>{link.label}</NavLink>)}</div>
            </div>}
            {userName.trim() && <span className="site-header-user" title={`${userName}님`}><strong>{userName}</strong>님</span>}
          </div>
        </div>
      </div>
      {isSearchOpen && <HeaderSearch searchInput={searchInput} popularKeywords={popularKeywords} onSearchInputChange={onSearchInputChange} onSearchSubmit={onSearchSubmit} onPopularKeywordSelect={onPopularKeywordSelect} onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

export { Header };
