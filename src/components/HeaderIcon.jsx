function HeaderIcon({ name }) {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
    heart: <path d="M20.5 5.8a5 5 0 0 0-7.1 0L12 7.2l-1.4-1.4a5 5 0 0 0-7.1 7.1L12 21l8.5-8.1a5 5 0 0 0 0-7.1Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    cart: <><path d="M3 3h2l2.4 12h11.8l2-8H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    chevron: <path d="m7 10 5 5 5-5" />
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

export { HeaderIcon };
