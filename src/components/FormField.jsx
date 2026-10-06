import './FormField.css';

// 입력 이벤트는 children 의 입력 요소가 직접 받는다. 여기에는 이벤트 props 가 없다.
// errorMessage 는 fieldErrors[항목명] 을 그대로 받는다.
//
// label 을 반드시 표시한다. placeholder 로 대신하지 않는다.
function FormField({
  label = '',
  htmlFor = '',
  required = false,
  errorMessage = null,
  children
}) {
  return (
    <div className="form-field">
      <label className="form-field-label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="form-field-required">필수</span> : null}
      </label>

      <div className="form-field-control">{children}</div>

      {/* 오류가 없을 때도 문구 자리를 비워 둔다. 오류가 뜰 때 아래 요소가 밀리지 않는다 */}
      <p className="form-field-error">{errorMessage}</p>
    </div>
  );
}

export { FormField };
