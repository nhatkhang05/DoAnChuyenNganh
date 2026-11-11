import { useState } from 'react'
import Stepper from '../../components/Stepper'
import { prescriptionSteps, stepIndex } from '../../data/steps'
import { Btn, Card, Empty, PageTitle, SampleNote, Tag, type Tone } from '../../components/ui'
import { medicines } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { drugTotal, findDoctor, money } from '../../utils'
import type { PrescriptionStatus } from '../../types'

const tone: Record<PrescriptionStatus, Tone> = { new: 'gray', waitingPay: 'wait', paid: 'info', delivered: 'ok' }
const mainLabel: Record<PrescriptionStatus, string> = {
  new: 'Nhập đơn, tính tiền thuốc',
  waitingPay: 'Chờ bệnh nhân đóng tiền',
  paid: 'Giao thuốc',
  delivered: 'Đã giao thuốc',
}
const hint: Record<PrescriptionStatus, string> = {
  new: 'Kiểm tra đơn rồi bấm để tính tiền thuốc. Hóa đơn sẽ chuyển sang thu ngân.',
  waitingPay: 'Chưa thấy thanh toán nên chưa được giao thuốc.',
  paid: 'Hóa đơn đã thanh toán, có thể giao thuốc cho bệnh nhân.',
  delivered: 'Hoàn tất. Đơn này không còn trong danh sách chờ.',
}
const noteBg: Record<PrescriptionStatus, string> = { new: '#f3f8f7', waitingPay: '#fff6e0', paid: '#e3f1fb', delivered: '#e3f6ec' }

export default function DonThuoc({ mode }: { mode: 'pending' | 'delivered' }) {
  const { prescriptions, appointments, computeDrugFee, deliverMedicine } = useClinic()
  const [selId, setSelId] = useState<number | null>(null)

  const list = prescriptions.filter((p) => (mode === 'pending' ? p.status !== 'delivered' : p.status === 'delivered'))
  const current = list.find((p) => p.id === selId) ?? list[0]
  const apptOf = (id: number) => appointments.find((a) => a.id === id)

  return (
    <>
      <PageTitle
        title={mode === 'pending' ? 'Đơn thuốc chờ xử lý' : 'Đơn đã giao'}
        sub={mode === 'pending' ? 'Nhập đơn, tính tiền thuốc. Chỉ giao thuốc khi bệnh nhân đã đóng tiền ở thu ngân.' : 'Các đơn thuốc đã giao cho bệnh nhân.'}
      />
      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 max-w-[320px] flex-[1_1_250px] flex-col gap-2.5 p-[18px]">
          <div className="text-base font-bold">Danh sách đơn</div>
          {list.length === 0 && <Empty>{mode === 'pending' ? 'Chưa có đơn thuốc nào. Bác sĩ cần kê đơn và bấm hoàn tất khám.' : 'Chưa giao đơn nào.'}</Empty>}
          {list.map((p) => {
            const a = apptOf(p.appointmentId)
            return (
              <button key={p.id} type="button" onClick={() => setSelId(p.id)} className={`flex cursor-pointer flex-col gap-1.5 rounded-[14px] border p-3.5 text-left ${current?.id === p.id ? 'border-[#9fd6cd] bg-[#e8f6f3]' : 'border-line bg-white'}`}>
                <div className="flex items-center justify-between gap-2"><b>{a?.patientName}</b><Tag tone={tone[p.status]}>{prescriptionSteps[stepIndex[p.status]]}</Tag></div>
                <div className="text-[13px] text-muted">{findDoctor(a?.doctorId ?? 0)?.name}</div>
              </button>
            )
          })}
        </Card>

        {current && (
          <Card className="flex min-w-0 flex-[3_1_480px] flex-col gap-[22px] p-6">
            <div>
              <div className="text-[21px] font-extrabold">Đơn thuốc của {apptOf(current.appointmentId)?.patientName}</div>
              <div className="text-[14.5px] text-muted">Số thứ tự {apptOf(current.appointmentId)?.queueNo} · Kê ngày {apptOf(current.appointmentId)?.date}</div>
            </div>
            <Stepper status={current.status} />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14.5px]">
                <thead>
                  <tr className="bg-soft text-left text-[12.5px] text-muted">
                    <th className="rounded-l-[10px] px-3 py-2.5">Thuốc</th><th className="px-3 py-2.5">Số lượng</th><th className="px-3 py-2.5">Đơn giá</th><th className="rounded-r-[10px] px-3 py-2.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {current.lines.map((l) => {
                    const m = medicines.find((x) => x.id === l.medicineId)!
                    return (
                      <tr key={l.medicineId} className="border-b border-[#edf3f2]">
                        <td className="px-3 py-3.5 font-semibold">{m.name}</td>
                        <td className="px-3 py-3.5">{l.qty} {m.unit}</td>
                        <td className="px-3 py-3.5">{money(m.price)}</td>
                        <td className="px-3 py-3.5 text-right">{money(m.price * l.qty)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-baseline justify-end gap-3.5"><span className="text-[15px] text-muted">Tiền thuốc</span><span className="text-[26px] font-extrabold">{money(drugTotal(current.lines, medicines))}</span></div>
            <div style={{ background: noteBg[current.status] }} className="flex flex-wrap items-center gap-3 rounded-[14px] p-4">
              <Btn
                disabled={current.status === 'waitingPay' || current.status === 'delivered'}
                onClick={() => (current.status === 'new' ? computeDrugFee(current.id) : deliverMedicine(current.id))}
              >
                {mainLabel[current.status]}
              </Btn>
              <div className="min-w-[220px] flex-1 text-sm text-[#33504e]">{hint[current.status]}</div>
            </div>
          </Card>
        )}
      </div>
      <SampleNote />
    </>
  )
}
