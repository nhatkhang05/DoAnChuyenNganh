import { useState } from 'react'
import { Card, Chip, PageTitle, SampleNote } from '../../components/ui'
import { doctors, statsSample, TODAY } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { initialOf, money } from '../../utils'

type KhoangThoiGian = 'today' | 'week' | 'month'
const cacTab: { key: KhoangThoiGian; label: string }[] = [{ key: 'today', label: 'Hôm nay' }, { key: 'week', label: '7 ngày qua' }, { key: 'month', label: 'Tháng này' }]

export default function ThongKe() {
  const { appointments, invoices, prescriptions } = useClinic()
  const [khoangTG, setKhoangTG] = useState<KhoangThoiGian>('today')

  // Hôm nay: tính thật từ dữ liệu đang chạy. 7 ngày / tháng: số liệu mẫu.
  const homNay = appointments.filter((a) => a.date === TODAY)
  const doanhThuCua = (doctorId?: number) =>
    invoices.filter((i) => i.paid && (doctorId === undefined || appointments.find((a) => a.id === i.appointmentId)?.doctorId === doctorId)).reduce((s, i) => s + i.visitFee + (i.drugFee ?? 0), 0)

  let doanhThu: string, theThongTin: [string, string][], cotBieuDo: { label: string; value: number; text: string }[], donVi: string, trangThai: number[], theoBacSi: number[]
  if (khoangTG === 'today') {
    doanhThu = money(doanhThuCua())
    theThongTin = [
      ['Lịch hẹn hôm nay', String(homNay.length)],
      ['Lượt khám hoàn tất', String(homNay.filter((a) => a.status === 'done').length)],
      ['Đơn thuốc đã giao', String(prescriptions.filter((p) => p.status === 'delivered').length)],
    ]
    donVi = 'bác sĩ (nghìn đồng)'
    cotBieuDo = doctors.map((d) => ({ label: d.name.split(' ').pop()!, value: doanhThuCua(d.id) / 1000, text: String(doanhThuCua(d.id) / 1000) }))
    trangThai = [homNay.filter((a) => a.status === 'done').length, homNay.filter((a) => a.status === 'cancelled').length, homNay.filter((a) => a.status === 'booked').length]
    theoBacSi = doctors.map((d) => homNay.filter((a) => a.doctorId === d.id && a.status === 'done').length)
  } else {
    const s = statsSample[khoangTG]
    doanhThu = String(s.revenue).replace('.', ',') + ' triệu đ'
    theThongTin = [['Lịch hẹn đã đặt', String(s.booked)], ['Lượt khám hoàn tất', String(s.done)], ['Đơn thuốc đã giao', String(s.delivered)]]
    donVi = (khoangTG === 'week' ? 'ngày' : 'tuần') + ' (triệu đồng)'
    cotBieuDo = s.labels.map((l, i) => ({ label: l, value: s.values[i], text: String(s.values[i]).replace('.', ',') }))
    trangThai = s.status
    theoBacSi = s.byDoctor
  }
  const giaTriLonNhat = Math.max(...cotBieuDo.map((b) => b.value), 1)
  const tongTrangThai = Math.max(trangThai.reduce((a, b) => a + b, 0), 1)
  const cacDongTrangThai = [['Hoàn tất', '#0b8f84'], ['Đã hủy', '#e5533d'], ['Chưa đến', '#e0a526']]

  return (
    <>
      <PageTitle title="Thống kê, báo cáo" sub="Doanh thu chỉ tính các hóa đơn đã thanh toán.">
        <div className="flex flex-wrap gap-2 rounded-full bg-white p-1.5 shadow-[0_1px_2px_rgba(16,60,56,.05)]">
          {cacTab.map((t) => <Chip key={t.key} active={khoangTG === t.key} onClick={() => setKhoangTG(t.key)}>{t.label}</Chip>)}
        </div>
      </PageTitle>

      <div className="flex flex-wrap gap-3.5">
        <div className="flex flex-[2_1_280px] flex-col gap-1.5 rounded-[18px] bg-gradient-to-br from-deep to-brand p-[22px] text-white shadow-card">
          <div className="text-sm text-[#bfe9e3]">Doanh thu</div>
          <div className="text-[38px] font-extrabold">{doanhThu}</div>
          <div className="text-[13.5px] text-[#bfe9e3]">Từ hóa đơn đã thanh toán</div>
        </div>
        {theThongTin.map(([nhan, giaTri]) => (
          <Card key={nhan} className="flex flex-[1_1_170px] flex-col gap-1.5 p-[22px]">
            <div className="text-sm text-muted">{nhan}</div>
            <div className="text-[32px] font-extrabold">{giaTri}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 flex-[3_1_420px] flex-col gap-3.5 p-[22px]">
          <div className="text-[17px] font-bold">Doanh thu theo {donVi}</div>
          <div className="flex h-[210px] items-end gap-3.5 border-b border-line">
            {cotBieuDo.map((b) => (
              <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="text-[12.5px] font-semibold">{b.text}</div>
                <div style={{ height: Math.max(Math.round((b.value / giaTriLonNhat) * 150), 3) }} className="w-full max-w-[46px] rounded-t-[10px] bg-gradient-to-b from-mint to-brand" />
              </div>
            ))}
          </div>
          <div className="flex gap-3.5">{cotBieuDo.map((b) => <div key={b.label} className="flex-1 text-center text-[12.5px] text-muted">{b.label}</div>)}</div>
        </Card>
        <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-[22px]">
          <Card className="flex flex-col gap-3.5 p-[22px]">
            <div className="text-[17px] font-bold">Tình trạng lịch hẹn</div>
            {cacDongTrangThai.map(([nhan, mau], i) => (
              <div key={nhan} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm"><span>{nhan}</span><b>{trangThai[i]}</b></div>
                <div className="h-[9px] rounded-[5px] bg-page"><div style={{ width: `${(trangThai[i] / tongTrangThai) * 100}%`, background: mau }} className="h-[9px] rounded-[5px]" /></div>
              </div>
            ))}
          </Card>
          <Card className="flex flex-col gap-3 p-[22px]">
            <div className="text-[17px] font-bold">Lượt khám theo bác sĩ</div>
            {doctors.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#dff3f0] font-bold text-[#07685f]">{initialOf(d.name)}</div>
                <div className="flex-1 text-[14.5px]">{d.name}</div>
                <b>{theoBacSi[i]}</b>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <SampleNote />
    </>
  )
}
