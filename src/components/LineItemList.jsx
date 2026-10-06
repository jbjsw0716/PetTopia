import { formatWon } from '../utils/money.js';
import './LineItemList.css';

// items 한 건은 { id, name, unitPrice, quantity, lineTotal } 이며,
// 할인 표시는 discountPercent·discountAmount 를 더한다.
//
// 저장 시점 값을 그대로 표시한다. 현재 상품 가격을 다시 읽지 않는다.
function LineItemList({ items = [], showDiscount = false }) {
  return (
    <table className="line-item-list">
      <thead>
        <tr>
          <th className="line-item-list-head" scope="col">이름</th>
          <th className="line-item-list-head" scope="col">단가</th>
          <th className="line-item-list-head" scope="col">수량</th>
          {showDiscount ? (
            <th className="line-item-list-head" scope="col">할인</th>
          ) : null}
          <th className="line-item-list-head" scope="col">금액</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="line-item-list-cell line-item-list-name">{item.name}</td>
            <td className="line-item-list-cell">{formatWon(item.unitPrice)}</td>
            <td className="line-item-list-cell">{item.quantity}개</td>
            {showDiscount ? (
              <td className="line-item-list-cell">
                {item.discountPercent > 0
                  ? item.discountPercent + '% -' + formatWon(item.discountAmount)
                  : '-'}
              </td>
            ) : null}
            <td className="line-item-list-cell line-item-list-total">
              {formatWon(item.lineTotal)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { LineItemList };
