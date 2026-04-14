import useToastStore from '../../store/useToastStore.js'

const TYPE_STYLES = {
  success: 'bg-pc-ink text-white',
  error:   'bg-pc-danger text-white',
  info:    'bg-pc-green text-white',
}

export default function ToastContainer() {
  const toasts  = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none w-full px-5 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`animate-slide-up w-full flex items-center gap-3 px-4 py-[11px] rounded-btn text-[13px] font-semibold pointer-events-auto cursor-pointer ${TYPE_STYLES[t.type] || TYPE_STYLES.success}`}
          style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.2)' }}
        >
          {t.type === 'error' ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
              <path d="M5 5l4 4M9 5l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
              <path d="M3 7l2.5 2.5L11 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {t.message}
        </div>
      ))}
    </div>
  )
}
