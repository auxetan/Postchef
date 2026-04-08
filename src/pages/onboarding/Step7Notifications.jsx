import Button from '../../components/ui/Button.jsx'
import ChefAvatar from '../../components/ui/ChefAvatar.jsx'

export default function Step7Notifications({ onNext }) {
  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
    onNext()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-5 pt-4 pb-[110px]">
        {/* Chef bubble */}
        <div className="flex items-start gap-[10px] mb-5">
          <ChefAvatar size={36} />
          <div className="bg-pc-divider rounded-[20px_20px_20px_4px] px-4 py-[14px] text-[14px] leading-[1.6] text-[#111] flex-1">
            Active les notifications — je te rappelle tes posts chaque lundi matin.
          </div>
        </div>

        {/* Notification preview */}
        <div className="bg-pc-divider rounded-[20px] p-4 mb-5">
          <div className="text-[10px] text-pc-hint text-center mb-[10px]">Aperçu notification</div>
          <div className="bg-white rounded-[14px] p-[13px] flex gap-[11px] items-start border-2 border-pc-green">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-pc-green flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C6.48 2 2 6.48 2 11s4.48 9 9 9 9-4.48 9-9-4.48-9-9-9zm-1 13.5v-8l6 4-6 4z" fill="#fff" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#111] mb-[2px]">Tes posts de la semaine sont prêts</div>
              <div className="text-[12px] text-pc-muted leading-[1.4]">3 idées fraîches t'attendent — 5 min et c'est réglé.</div>
            </div>
          </div>
        </div>

        <h2 className="text-[20px] font-extrabold text-pc-text tracking-[-0.5px] mb-[6px]">
          Ne rate jamais un bon moment.
        </h2>
        <p className="text-[13px] text-pc-muted leading-[1.6]">
          Rappels intelligents selon ton rythme. Facile à désactiver à tout moment.
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-[14px] bg-white space-y-2">
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
