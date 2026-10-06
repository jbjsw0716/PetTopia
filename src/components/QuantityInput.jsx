import { MAX_QUANTITY } from '../utils/constants.js';
import './QuantityInput.css';

// value 는 입력 중 문자열이다.
// 정수 변환과 범위 검사는 화면이 한다 — 입력 도중의 빈 값이나 0 때문에 확정 수량이
// 망가지지 않게 하기 위해서다. onQuantityChange 도 문자열을 그대로 올린다.
//
// min·max 는 여기서 확정 수량을 자르기 위한 값이 아니라, 증감 버튼을 끄기 위한 값이다.
function QuantityInput({
  value = '',
  min = 1,
  max = MAX_QUANTITY,
  errorMessage = null,
  onQuantityChange = () => {}
}) {
  const parsed = Number.parseInt(value, 10);
  const current = Number.isNaN(parsed) ? min : parsed;

  function handleStep(step) {
    onQuantityChange(String(current + step));
  }

  return (
    <div className="quantity-input">
      <div className="quantity-input-control">
        <button
          type="button"
          className="quantity-input-step"
          aria-label="수량 줄이기"
          disabled={current <= min}
          onClick={() => handleStep(-1)}
        >
          −
        </button>
        <input
          className="quantity-input-field"
          type="text"
          inputMode="numeric"
          value={value}
          aria-label="수량"
          onChange={(event) => onQuantityChange(event.target.value)}
        />
        <button
          type="button"
          className="quantity-input-step"
          aria-label="수량 늘리기"
          disabled={current >= max}
          onClick={() => handleStep(1)}
        >
          +
        </button>
      </div>

      {/* 오류가 없을 때도 자리를 비워 둬 아래 요소가 밀리지 않게 한다 */}
      <p className="quantity-input-error">{errorMessage}</p>
    </div>
  );
}

export { QuantityInput };
