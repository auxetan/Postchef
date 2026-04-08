export default function Card({ children, featured = false, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card border ${featured ? 'border-2 border-pc-green' : 'border-pc-divider'} p-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
