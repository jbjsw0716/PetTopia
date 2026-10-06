import { useEffect, useId, useRef, useState } from 'react';
import './ProductCarousel.css';

function ProductCarousel({ label, className = '', children }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: false });
  const [isDragging, setDragging] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const update = () => setEdges({ start: track.scrollLeft <= 2, end: track.scrollLeft >= track.scrollWidth - track.clientWidth - 2 });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    for (const child of track.children) observer.observe(child);
    track.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); track.removeEventListener('scroll', update); };
  }, [children]);

  function move(direction) {
    const track = trackRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * (track.clientWidth + 24), behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  function handlePointerDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
    suppressClick.current = false;
    dragRef.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = event.clientX - drag.x;
    if (!drag.moved && Math.abs(delta) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    suppressClick.current = true;
    event.preventDefault();
    event.currentTarget.scrollLeft = drag.left - delta;
  }

  function handlePointerEnd(event) {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="product-carousel" role="region" aria-label={label}>
      <button type="button" className="product-carousel-arrow product-carousel-prev" aria-label={`${label} 이전 상품`} aria-controls={id} disabled={edges.start} onClick={() => move(-1)}>‹</button>
      <div ref={trackRef} id={id} className={`home-products product-carousel-track ${className}`} tabIndex={0} aria-label={`${label} 상품 목록`} data-dragging={isDragging}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}
        onLostPointerCapture={() => { dragRef.current = null; setDragging(false); }}
        onPointerLeave={() => { if (!dragRef.current?.moved) dragRef.current = null; }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
          if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); event.currentTarget.scrollLeft = event.key === 'Home' ? 0 : event.currentTarget.scrollWidth; }
        }}>
        {children}
      </div>
      <button type="button" className="product-carousel-arrow product-carousel-next" aria-label={`${label} 다음 상품`} aria-controls={id} disabled={edges.end} onClick={() => move(1)}>›</button>
    </div>
  );
}

export { ProductCarousel };
