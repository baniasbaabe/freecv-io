export function Field({ label, value, onChange, area, rows = 3, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; rows?: number; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="label mb-1">{label}</span>
      {area ? (
        <textarea className="input resize-y" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
