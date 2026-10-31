import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BtnLink, Btn, Card, SampleNote, PageTitle } from '../../components/ui'
import { bookingDays, doctors, slotTimes } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { initialOf, isSlotBusy, money } from '../../utils'

const StepNo = ({ n }: { n: number }) => (
  <div className="flex size-[30px] items-center justify-center rounded-full bg-deep font-bold text-mint">{n}</div>
)

export default function Booking() {
  const { appointments, bookAppointment, user } = useClinic()
  const [params] = useSearchParams()
  const [doctorId, setDoctorId] = useState(Number(params.get('bacsi')) || doctors[0].id)
  const [dayIdx, setDayIdx] = useState(0)
  const [slotIdx, setSlotIdx] = useState(-1)
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)

  const doctor = doctors.find((d) => d.id === doctorId)!
  const day = bookingDays[dayIdx]

  return (
    <>
      <PageTitle title="Đặt lịch khám" sub="3 bước: chọn bác sĩ, chọn ngày giờ, xác nhận." />
      <div className="flex flex-wrap items-start gap-[22px]">
        <div className="flex min-w-0 flex-[3_1_520px] flex-col gap-[18px]">
          <Card className="flex flex-col gap-3.5 p-[22px]">
            <div className="flex items-center gap-2.5"><StepNo n={1} /><div className="text-[17px] font-bold">Chọn bác sĩ</div></div>
            <div className="flex flex-wrap gap-3">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setDoctorId(d.id); setSlotIdx(-1); setDone(false) }}
                  className={`flex flex-[1_1_200px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left ${doctorId === d.id ? 'border-brand bg-[#e8f6f3]' : 'border-line bg-white'}`}
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-brand font-extrabold text-white">{initialOf(d.name)}</div>
                  <div>
                    <div className="text-[14.5px] font-bold">{d.name}</div>
                    <div className="text-[13px] text-muted">{d.specialty}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-[22px]">
            <div className="flex items-center gap-2.5"><StepNo n={2} /><div className="text-[17px] font-bold">Chọn ngày và giờ</div></div>
            <div className="flex flex-wrap gap-2.5">
              {bookingDays.map((d, i) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => { setDayIdx(i); setSlotIdx(-1); setDone(false) }}
                  className={`w-[72px] cursor-pointer rounded-2xl border py-2.5 ${dayIdx === i ? 'border-brand bg-brand text-white' : 'border-[#cfe2df] bg-white text-ink'}`}
                >
                  <div className="text-[12.5px] font-medium">{d.dow}</div>
                  <div className="text-[21px] font-extrabold">{d.day}</div>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {slotTimes.map((t, i) => {
                const busy = isSlotBusy(appointments, doctorId, day.date, t, dayIdx, i)
                const on = slotIdx === i
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={busy}
                    onClick={() => { setSlotIdx(i); setDone(false) }}
                    className={`min-h-11 min-w-[88px] cursor-pointer rounded-xl border text-[14.5px] font-semibold ${
                      busy ? 'cursor-not-allowed border-[#eceff0] bg-[#eceff0] text-[#9aa9a7] line-through' : on ? 'border-brand bg-brand text-white' : 'border-[#cfe2df] bg-white text-ink hover:border-brand'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-4 text-[13px] text-muted"><span>Ô trắng: còn trống</span><span>Ô xám gạch ngang: đã có người đặt</span></div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ly" className="text-sm font-semibold">Lý do khám (không bắt buộc)</label>
              <textarea id="ly" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Ví dụ: đau họng, ho 3 ngày" className="w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 py-3 text-[15px]" />
            </div>
          </Card>
        </div>

        <Card className="sticky top-4 flex min-w-0 max-w-[380px] flex-[1_1_300px] flex-col gap-4 p-6">
          <div className="flex items-center gap-2.5"><StepNo n={3} /><div className="text-[17px] font-bold">Xác nhận</div></div>
          <div className="flex flex-col gap-2.5 text-[14.5px]">
            <Row label="Bệnh nhân" value={user?.name ?? ''} />
            <Row label="Bác sĩ" value={doctor.name} />
            <Row label="Chuyên khoa" value={doctor.specialty} />
            <Row label="Ngày" value={`${day.dow}, ${day.date}`} />
            <Row label="Giờ" value={slotIdx >= 0 ? slotTimes[slotIdx] : 'Chưa chọn'} />
            <div className="flex justify-between gap-2.5 border-t border-line pt-2.5"><span className="text-muted">Tiền khám</span><b>{money(doctor.price)}</b></div>
          </div>
          <Btn
            disabled={slotIdx < 0 || done}
            onClick={() => { bookAppointment(doctorId, day.date, slotTimes[slotIdx], reason); setDone(true) }}
          >
            {done ? 'Đã đặt lịch' : 'Xác nhận đặt lịch'}
          </Btn>
          {done && (
            <>
              <div className="rounded-xl bg-[#dcf4e8] px-3.5 py-3 text-sm leading-normal text-[#116a40]">Đặt lịch thành công. Đến phòng khám đúng giờ, lễ tân sẽ cấp số thứ tự cho bạn.</div>
              <BtnLink to="/benh-nhan/lich-cua-toi" variant="light" size="sm">Xem lịch của tôi</BtnLink>
            </>
          )}
          <div className="text-[13px] leading-normal text-muted">Tiền khám và tiền thuốc đóng ở quầy thu ngân sau khi khám.</div>
        </Card>
      </div>
      <SampleNote />
    </>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-2.5"><span className="text-muted">{label}</span><b>{value}</b></div>
)
