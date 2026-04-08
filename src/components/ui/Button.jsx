export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center rounded-pill font-bold text-[15px] leading-none transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-pc-green/40 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-pc-green text-white hover:bg-pc-green-dark px-7 py-[15px]',
    ghost: 'bg-white text-[#374151] border-[1.5px] border-pc-border hover:bg-pc-bg px-7 py-[15px]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
