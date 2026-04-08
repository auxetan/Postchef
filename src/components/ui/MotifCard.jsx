export default function MotifCard({ icon, name, desc, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-elem border-[1.5px] p-[14px_12px] cursor-pointer text-center bg-white transition-all duration-150 w-full
        ${selected ? 'border-pc-green bg-pc-green-light' : 'border-pc-border hover:border-pc-green-mid'}`}
    >
      <div className="w-11 h-11 rounded-[12px] bg-pc-green-light mx-auto mb-2 flex items-center justify-center">
        {icon}
      </div>
      <div className={`text-[13px] font-semibold mb-[2px] ${selected ? 'text-pc-green-dark' : 'text-[#111]'}`}>
        {name}
      </div>
      <div className="text-[11px] text-pc-muted">{desc}</div>
    </button>
  )
}
