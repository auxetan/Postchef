import { PC_GREEN } from '../../utils/colors.js'
export default function ChefAvatar({ size = 36 }) {
  const iconSize = Math.round(size * 0.5)
  return (
    <div
      className="rounded-full bg-pc-green-light flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" fill={PC_GREEN} />
        <path
          d="M3 16c0-3.31 2.69-6 6-6s6 2.69 6 6"
          stroke={PC_GREEN}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
