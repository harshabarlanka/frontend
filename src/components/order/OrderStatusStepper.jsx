import { ORDER_STATUSES } from '../../constants'
import Badge from '../common/Badge'

const STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'packed',    label: 'Packed',    icon: '📦' },
  { key: 'shipped',   label: 'Shipped',   icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
]

const OrderStatusStepper = ({ status }) => {
  if (status === 'cancelled' || status === 'refunded') {
    const info = ORDER_STATUSES[status]
    return (
      <div className="flex items-center gap-2 py-4">
        <span className="text-2xl">{status === 'cancelled' ? '❌' : '↩️'}</span>
        <div>
          <Badge variant="danger">{info.label}</Badge>
          <p className="font-body text-xs text-earth-500 mt-1">
            {status === 'cancelled' ? 'This order was cancelled.' : 'Refund has been initiated.'}
          </p>
        </div>
      </div>
    )
  }

  const currentStep = ORDER_STATUSES[status]?.step ?? 0

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-earth-100" />
      <div
        className="absolute top-5 left-5 h-0.5 bg-brand-500 transition-all duration-700"
        style={{ width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100)}%` }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const stepNum     = idx + 1
          const isCompleted = currentStep >= stepNum
          const isCurrent   = currentStep === stepNum

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm z-10 border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-white border-earth-200 text-earth-300'
                } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
              >
                {isCompleted ? step.icon : stepNum}
              </div>
              <span className={`font-body text-xs text-center leading-tight ${isCompleted ? 'text-brand-700 font-bold' : 'text-earth-400'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderStatusStepper
