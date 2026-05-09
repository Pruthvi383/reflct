export function Stars({ value = 0, onChange }) {
  return (
    <div className="stars" aria-label={`Rating ${value}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" className={star <= value ? "active" : ""} onClick={() => onChange?.(star)}>
          ★
        </button>
      ))}
    </div>
  );
}
