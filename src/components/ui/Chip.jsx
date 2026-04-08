export default function Chip({ label, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-[15px] py-[9px] rounded-pill border-[1.5px] text-[13px] font-medium transition-all duration-150 cursor-pointer
        ${selected
          ? 'bg-pc-green text-white border-pc-green'
          : 'bg-pc-surface text-pc-ink border-pc-border hover:border-pc-green/40'
        }`}
    >
      {label}
    </button>
  )
}
