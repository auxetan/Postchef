export default function ProgressBar({ step, total = 8 }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div className="h-1 bg-pc-green-light mx-5 my-3 rounded-full">
      <div
        className="h-1 bg-pc-green rounded-full transition-all duration-400 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
