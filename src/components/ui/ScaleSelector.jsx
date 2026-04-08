export default function ScaleSelector({ options, value, onChange }) {
  return (
    <div className="flex gap-[6px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-[10px] px-1 rounded-[12px] border-[1.5px] text-[12px] font-semibold text-center leading-tight transition-all duration-150 cursor-pointer
            ${value === opt.value
              ? 'bg-pc-green text-white border-pc-green'
              : 'bg-pc-surface text-pc-ink-3 border-pc-border hover:border-pc-green/40'
            }`}
        >
          {opt.label}
          {opt.sub && (
            <span className="block text-[10px] font-normal opacity-80 mt-[1px]">
              {opt.sub}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
