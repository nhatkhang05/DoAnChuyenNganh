import { prescriptionSteps, stepIndex } from '../data/steps'
import type { PrescriptionStatus } from '../types'

// Thanh tiến trình của đơn thuốc: Mới kê -> Chờ thanh toán -> Đã thanh toán -> Đã giao
export default function Stepper({ status }: { status: PrescriptionStatus }) {
  const cur = stepIndex[status]
  const allDone = status === 'delivered'
  return (
    <div className="flex items-start py-1">
      {prescriptionSteps.map((label, i) => {
        const done = i < cur || allDone
        const now = i === cur && !allDone
        return (
          <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <div className={`h-[3px] flex-1 rounded-sm ${i === 0 ? 'bg-transparent' : i <= cur || allDone ? 'bg-brand' : 'bg-line'}`} />
              <div
                className={`flex size-[38px] flex-none items-center justify-center rounded-full border-2 font-bold ${
                  done ? 'border-transparent bg-brand text-white' : now ? 'border-transparent bg-deep text-white' : 'border-[#d3e1df] bg-white text-[#8aa19e]'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div className={`h-[3px] flex-1 rounded-sm ${i === prescriptionSteps.length - 1 ? 'bg-transparent' : i < cur || allDone ? 'bg-brand' : 'bg-line'}`} />
            </div>
            <div className={`text-center text-[13.5px] font-semibold ${done || now ? 'text-ink' : 'text-[#8aa19e]'}`}>{label}</div>
          </div>
        )
      })}
    </div>
  )
}
