import Button from '../../components/ui/Button.jsx'
import { PC_GREEN } from '../../utils/colors.js'

export default function Step7Notifications({ onNext }) {
  const requestNotifications = () => {
    if ('Notification' in window) Notification.requestPermission()
    onNext()
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex-1 px-6 pt-7 pb-[120px]">

        {/* Icon */}
        <div className="w-[72px] h-[72px] rounded-[22px] bg-pc-green-light flex items-center justify-center mb-8">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path d="M17 4a10 10 0 0110 10v5l2 3H5l2-3v-5A10 10 0 0117 4z" stroke={PC_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 26a3 3 0 006 0" stroke={PC_GREEN} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className="text-[26px] font-black tracking-[-0.04em] text-pc-ink leading-tight mb-3">
          Ne rate jamais<br/>un bon moment.
        </h2>
        <p className="text-[14px] text-pc-ink-3 leading-[1.6] mb-8">
          Je te rappelle tes posts chaque lundi matin. Facile à désactiver à tout moment.
        </p>

        {/* Notification preview */}
        <div className="bg-pc-surface border border-pc-border rounded-card p-4">
          <p className="pc-section-label mb-3">Aperçu de la notification</p>
          <div className="bg-white rounded-elem p-4 flex gap-3 items-start border-2 border-pc-green">
            <div className="w-10 h-10 rounded-[10px] bg-pc-green flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4.5 4.5 7.5-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-pc-ink mb-1">Tes posts de la semaine sont prêts</p>
              <p className="text-[12px] text-pc-ink-3 leading-[1.4]">3 idées fraîches t'attendent — 5 min et c'est réglé.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:absolute px-6 pb-8 pt-4 bg-white border-t border-pc-rule max-w-[360px] md:mx-auto w-full space-y-2">
        <Button fullWidth onClick={requestNotifications}>
          Activer les notifications
        </Button>
        <Button fullWidth variant="ghost" onClick={onNext}>
          Peut-être plus tard
        </Button>
      </div>
    </div>
  )
}
