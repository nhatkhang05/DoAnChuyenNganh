import { useState } from 'react'
import { Btn, BtnLink, Card, Chip, Empty, PageTitle, SampleNote, Tag } from '../../components/ui'
import Stepper from '../../components/Stepper'
import { CURRENT_PATIENT_ID, pastVisits } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { dayLabel, lineText, money, monthLabel } from '../../utils'
import type { AppointmentStatus } from '../../types'

const statusTag: Record<AppointmentStatus, { tone: 'ok' | 'info' | 'no' | 'gray'; text: string }> = {
  booked: { tone: 'ok', text: 'Đã đặt' },
  arrived: { tone: 'info', text: 'Đã đến, đang chờ khám' },
  done: { tone: 'gray', text: 'Đã khám xong' },
  cancelled: { tone: 'no', text: 'Đã hủy' },
}

export default function LichCuaToi() {
  const { appointments, prescriptions, invoices, doctorsList, medicinesList, cancelAppointment } = useClinic()
  const [tab, setTab] = useState<'up' | 'past'>('up')

  const mine = appointments.filter((a) => a.patientId === CURRENT_PATIENT_ID)
  const upcoming = mine.filter((a) => a.status !== 'done')
  const doneToday = mine.filter((a) => a.status === 'done')
  const history = pastVisits.filter((v) => v.patientId === CURRENT_PATIENT_ID)

  return (
    <>
      <PageTitle title="Lịch của tôi" sub="Lịch sắp tới, lịch sử khám và đơn thuốc của bạn." />
      <div className="flex w-fit flex-wrap gap-2 rounded-full bg-white p-1.5 shadow-[0_1px_2px_rgba(16,60,56,.05)]">
        <Chip active={tab === 'up'} onClick={() => setTab('up')}>Sắp tới</Chip>
        <Chip active={tab === 'past'} onClick={() => setTab('past')}>Đã khám</Chip>
      </div>

      {tab === 'up' && (
        <div className="flex flex-col gap-[18px]">
          {upcoming.length === 0 && <Empty>Bạn chưa có lịch sắp tới.</Empty>}
          {upcoming.map((a) => {
            const d = doctorsList.find((doc) => doc.id === a.doctorId)
            const st = statusTag[a.status]
            return (
              <Card key={a.id} className="flex flex-wrap items-center gap-5 p-6">
                <div className="w-[78px] rounded-[18px] bg-brand-soft py-3 text-center text-[#07685f]">
                  <div className="text-[13px] font-semibold">{monthLabel(a.date)}</div>
                  <div className="text-[32px] font-extrabold leading-[1.1]">{dayLabel(a.date)}</div>
                </div>
                <div className="min-w-[240px] flex-1">
                  <div className="text-xl font-extrabold">{a.time} · {d?.name}</div>
                  <div className="text-[14.5px] text-muted">{d?.specialty}{a.reason ? ` · Lý do khám: ${a.reason}` : ''}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Tag tone={st.tone}>{st.text}</Tag>
                    {a.queueNo && <Tag tone="info">Số thứ tự {a.queueNo}</Tag>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {a.status === 'booked' && (
                    <>
                      <BtnLink to={`/benh-nhan/dat-lich?bacsi=${a.doctorId}`} variant="light" size="sm">Đổi lịch</BtnLink>
                      <Btn variant="danger" size="sm" onClick={() => cancelAppointment(a.id)}>Hủy lịch</Btn>
                    </>
                  )}
                  {a.status === 'cancelled' && <BtnLink to={`/benh-nhan/dat-lich?bacsi=${a.doctorId}`} size="sm">Đặt lại</BtnLink>}
                </div>
              </Card>
            )
          })}
          <div className="rounded-xl bg-[#fff6e0] px-4 py-3 text-[13.5px] leading-normal text-[#7a4d00]">
            Đến phòng khám trước giờ hẹn 10 phút để lễ tân xác nhận và cấp số thứ tự.
          </div>
        </div>
      )}

      {tab === 'past' && (
        <div className="flex flex-col gap-[18px]">
          {doneToday.map((a) => {
            const d = doctorsList.find((doc) => doc.id === a.doctorId)
            const rx = prescriptions.find((p) => p.appointmentId === a.id)
            const inv = invoices.find((i) => i.appointmentId === a.id)
            const visitFee = inv?.visitFee ?? d?.price ?? 50000
            const drugFee = inv?.drugFee ?? 0
            return (
              <Card key={a.id} className="flex flex-col gap-[18px] p-6">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <div className="text-[19px] font-extrabold">{a.date} · {d?.name}</div>
                    <div className="text-[14.5px] text-muted">{d?.specialty} · Chẩn đoán: {a.diagnosis || 'Viêm họng cấp'}</div>
                  </div>
                  <Tag tone="ok">Đã khám xong</Tag>
                </div>
                {rx && <Stepper status={rx.status} />}
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                  <div className="rounded-[14px] bg-soft px-4 py-3.5 text-[14.5px] leading-relaxed">
                    <div className="text-[13px] text-muted">Thuốc đã nhận</div>
                    {rx ? rx.lines.map((l) => <div key={l.medicineId} className="font-bold">{lineText(l, medicinesList)}</div>) : <div className="font-bold">Không kê thuốc</div>}
                  </div>
                  <div className="rounded-[14px] bg-soft px-4 py-3.5 text-[14.5px] leading-relaxed">
                    <div className="text-[13px] text-muted">Hẹn tái khám</div>
                    <div className="font-bold">{a.recheck && a.recheck !== 'Không hẹn' ? `Sau ${a.recheck}` : 'Không hẹn'}</div>
                    <div className="text-[13px] text-muted">Ghi chú: Uống đủ liều, giữ ấm cổ họng</div>
                  </div>
                  <div className="rounded-[14px] border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3.5 text-[14.5px] leading-relaxed">
                    <div className="text-[13px] font-bold text-[#116a40]">Chi phí đã thanh toán</div>
                    <div>Tiền khám: {money(visitFee)} · Thuốc: {money(drugFee)}</div>
                    <div className="font-extrabold text-deep">Tổng thu: {money(visitFee + drugFee)} ({inv?.method || 'Tiền mặt'})</div>
                  </div>
                </div>
              </Card>
            )
          })}

          {history.map((v) => (
            <Card key={v.id} className="flex flex-col gap-[18px] p-6">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <div className="text-[19px] font-extrabold">{v.date} · {v.doctorName}</div>
                  <div className="text-[14.5px] text-muted">{v.specialty} · Chẩn đoán: Viêm họng cấp</div>
                </div>
                <Tag tone="ok">Đã khám xong</Tag>
              </div>
              <Stepper status="delivered" />
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                <div className="rounded-[14px] bg-soft px-4 py-3.5 text-[14.5px] leading-relaxed">
                  <div className="text-[13px] text-muted">Thuốc đã nhận</div>
                  {v.medicines.map((m) => <div key={m} className="font-bold">{m}</div>)}
                </div>
                <div className="rounded-[14px] bg-soft px-4 py-3.5 text-[14.5px] leading-relaxed">
                  <div className="text-[13px] text-muted">Hẹn tái khám</div>
                  <div className="font-bold">{v.recheck}</div>
                  <div className="text-[13px] text-muted">Ghi chú: Uống đủ liều, giữ ấm cổ họng</div>
                </div>
                <div className="rounded-[14px] border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3.5 text-[14.5px] leading-relaxed">
                  <div className="text-[13px] font-bold text-[#116a40]">Chi phí đã thanh toán</div>
                  <div>Tiền khám: 50.000 đ · Thuốc: 81.000 đ</div>
                  <div className="font-extrabold text-deep">Tổng thu: 131.000 đ (Tiền mặt)</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <SampleNote />
    </>
  )
}