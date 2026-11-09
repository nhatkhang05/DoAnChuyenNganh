import { useState } from 'react'
import { Card, Chip, PageTitle, SampleNote } from '../../components/ui'
import { doctors, statsSample, TODAY } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { initialOf, money } from '../../utils'

type Range = 'today' | 'week' | 'month'
const tabs: { key: Range; label: string }[] = [{ key: 'today', label: 'Hôm nay' }, { key: 'week', label: '7 ngày qua' }, { key: 'month', label: 'Tháng này' }]

export default function Stats() {
  const { appointments, invoices, prescriptions } = useClinic()
  const [range, setRange] = useState<Range>('today')

  // Hôm nay: tính thật từ dữ liệu đang chạy. 7 ngày / tháng: số liệu mẫu.
  const today = appointments.filter((a) => a.date === TODAY)
  const revenueOf = (doctorId?: number) =>
    invoices.filter((i) => i.paid && (doctorId === undefined || appointments.find((a) => a.id === i.appointmentId)?.doctorId === doctorId)).reduce((s, i) => s + i.visitFee + (i.drugFee ?? 0), 0)

  let revenue: string, cards: [string, string][], bars: { label: string; value: number; text: string }[], unit: string, status: number[], perDoctor: number[]
  if (range === 'today') {
    revenue = money(revenueOf())
    cards = [
      ['Lịch hẹn hôm nay', String(today.length)],
      ['Lượt khám hoàn tất', String(today.filter((a) => a.status === 'done').length)],
      ['Đơn thuốc đã giao', String(prescriptions.filter((p) => p.status === 'delivered').length)],
    ]
    unit = 'bác sĩ (nghìn đồng)'
    bars = doctors.map((d) => ({ label: d.name.split(' ').pop()!, value: revenueOf(d.id) / 1000, text: String(revenueOf(d.id) / 1000) }))
    status = [today.filter((a) => a.status === 'done').length, today.filter((a) => a.status === 'cancelled').length, today.filter((a) => a.status === 'booked').length]
    perDoctor = doctors.map((d) => today.filter((a) => a.doctorId === d.id && a.status === 'done').length)
  } else {
    const s = statsSample[range]
    revenue = String(s.revenue).replace('.', ',') + ' triệu đ'
    cards = [['Lịch hẹn đã đặt', String(s.booked)], ['Lượt khám hoàn tất', String(s.done)], ['Đơn thuốc đã giao', String(s.delivered)]]
    unit = (range === 'week' ? 'ngày' : 'tuần') + ' (triệu đồng)'
    bars = s.labels.map((l, i) => ({ label: l, value: s.values[i], text: String(s.values[i]).replace('.', ',') }))
    status = s.status
    perDoctor = s.byDoctor
  }
  const max = Math.max(...bars.map((b) => b.value), 1)
  const totalStatus = Math.max(status.reduce((a, b) => a + b, 0), 1)
  const statusRows = [['Hoàn tất', '#0b8f84'], ['Đã hủy', '#e5533d'], ['Chưa đến', '#e0a526']]

  return (
    <>
      <PageTitle title="Thống kê, báo cáo" sub="Doanh thu chỉ tính các hóa đơn đã thanh toán.">
        <div className="flex flex-wrap gap-2 rounded-full bg-white p-1.5 shadow-[0_1px_2px_rgba(16,60,56,.05)]">
          {tabs.map((t) => <Chip key={t.key} active={range === t.key} onClick={() => setRange(t.key)}>{t.label}</Chip>)}
        </div>
      </PageTitle>

      <div className="flex flex-wrap gap-3.5">
        <div className="flex flex-[2_1_280px] flex-col gap-1.5 rounded-[18px] bg-gradient-to-br from-deep to-brand p-[22px] text-white shadow-card">
          <div className="text-sm text-[#bfe9e3]">Doanh thu</div>
          <div className="text-[38px] font-extrabold">{revenue}</div>
          <div className="text-[13.5px] text-[#bfe9e3]">Từ hóa đơn đã thanh toán</div>
        </div>
        {cards.map(([label, value]) => (
          <Card key={label} className="flex flex-[1_1_170px] flex-col gap-1.5 p-[22px]">
            <div className="text-sm text-muted">{label}</div>
            <div className="text-[32px] font-extrabold">{value}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 flex-[3_1_420px] flex-col gap-3.5 p-[22px]">
          <div className="text-[17px] font-bold">Doanh thu theo {unit}</div>
          <div className="flex h-[210px] items-end gap-3.5 border-b border-line">
            {bars.map((b) => (
              <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="text-[12.5px] font-semibold">{b.text}</div>
                <div style={{ height: Math.max(Math.round((b.value / max) * 150), 3) }} className="w-full max-w-[46px] rounded-t-[10px] bg-gradient-to-b from-mint to-brand" />
              </div>
            ))}
          </div>
          <div className="flex gap-3.5">{bars.map((b) => <div key={b.label} className="flex-1 text-center text-[12.5px] text-muted">{b.label}</div>)}</div>
        </Card>
        <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-[22px]">
          <Card className="flex flex-col gap-3.5 p-[22px]">
            <div className="text-[17px] font-bold">Tình trạng lịch hẹn</div>
            {statusRows.map(([label, color], i) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm"><span>{label}</span><b>{status[i]}</b></div>
                <div className="h-[9px] rounded-[5px] bg-page"><div style={{ width: `${(status[i] / totalStatus) * 100}%`, background: color }} className="h-[9px] rounded-[5px]" /></div>
              </div>
            ))}
          </Card>
          <Card className="flex flex-col gap-3 p-[22px]">
            <div className="text-[17px] font-bold">Lượt khám theo bác sĩ</div>
            {doctors.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#dff3f0] font-bold text-[#07685f]">{initialOf(d.name)}</div>
                <div className="flex-1 text-[14.5px]">{d.name}</div>
                <b>{perDoctor[i]}</b>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <SampleNote />
    </>
  )
}
