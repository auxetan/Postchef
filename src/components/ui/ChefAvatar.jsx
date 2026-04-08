export default function ChefAvatar({ size = 36 }) {
  const iconSize = Math.round(size * 0.5)
  return (
    <div
      className="rounded-full bg-pc-green-light flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" fill="#1D9E75" />
        <path
          d="M3 16c0-3.31 2.69-6 6-6s6 2.69 6 6"
          stroke="#1D9E75"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
