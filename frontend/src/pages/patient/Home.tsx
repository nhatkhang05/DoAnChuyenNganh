import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon, { type IconName } from '../../components/Icon'
import { BtnLink, Card, Chip, SampleNote, Tag } from '../../components/ui'
import { bookingDays, CURRENT_PATIENT_ID, doctors, slotTimes, specialties } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { dayLabel, findDoctor, initialOf, isSlotBusy, money, monthLabel } from '../../utils'

const tiles: { to: string; icon: IconName; title: string; sub: string; color: string }[] = [
  { to: '/benh-nhan/dat-lich', icon: 'cal', title: 'Đặt lịch khám', sub: 'Chọn bác sĩ, giờ trống', color: '#0b8f84' },
  { to: '/benh-nhan/lich-cua-toi', icon: 'list', title: 'Lịch của tôi', sub: 'Xem, đổi, hủy lịch', color: '#e0a526' },
  { to: '/benh-nhan/lich-cua-toi', icon: 'pill', title: 'Đơn thuốc', sub: 'Đơn và tình trạng thanh toán', color: '#5b8def' },
  { to: '/benh-nhan/lich-cua-toi', icon: 'folder', title: 'Lịch sử khám', sub: 'Bệnh án các lần trước', color: '#e5533d' },
]
const gradients = ['from-[#0b8f84] to-[#3fd1c0]', 'from-[#5b8def] to-[#8fb2ff]', 'from-[#e0a526] to-[#f3cf7a]', 'from-[#e5533d] to-[#f59a8a]']

export default function Home() {
  const { user, appointments } = useClinic()
  const [spec, setSpec] = useState('Tất cả')
  const [keyword, setKeyword] = useState('')

  const upcoming = appointments.find((a) => a.patientId === CURRENT_PATIENT_ID && (a.status === 'booked' || a.status === 'arrived'))
  const shown = doctors.filter(
    (d) => (spec === 'Tất cả' || d.specialty === spec) && (d.name + d.specialty).toLowerCase().includes(keyword.trim().toLowerCase()),
  )
  // giờ trống gần nhất của bác sĩ trong 7 ngày tới
  const nextFree = (doctorId: number) => {
    for (let di = 0; di < bookingDays.length; di++)
      for (let si = 0; si < slotTimes.length; si++)
        if (!isSlotBusy(appointments, doctorId, bookingDays[di].date, slotTimes[si], di, si))
          return `${slotTimes[si]} ${di === 0 ? 'hôm nay' : bookingDays[di].date.slice(0, 5)}`
    return 'Hết chỗ'
  }

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-[22px]">
        <div className="relative flex min-w-0 flex-[3_1_520px] flex-col gap-[18px] overflow-hidden rounded-3xl bg-gradient-to-br from-deep to-brand px-9 py-[34px] text-white">
          <div className="absolute -right-[60px] -top-[60px] size-60 rounded-full bg-white/[.07]" />
          <div className="relative text-[15px] text-[#bfe9e3]">Xin chào, {user?.name}</div>
          <h1 className="relative m-0 text-4xl font-extrabold leading-tight">Hôm nay bạn muốn<br />khám gì?</h1>
          <div className="relative flex min-h-12 max-w-[520px] items-center gap-2.5 rounded-[14px] bg-white px-4 text-muted shadow-card">
            <Icon name="search" size={20} />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm bác sĩ hoặc chuyên khoa..." className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-ink outline-0" />
          </div>
        </div>
        <Card className="flex min-w-0 flex-[2_1_300px] flex-col gap-3.5 p-6">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold">Lịch sắp tới</div>
            {upcoming && <Tag tone={upcoming.status === 'arrived' ? 'info' : 'ok'}>{upcoming.status === 'arrived' ? 'Đã đến' : 'Đã đặt'}</Tag>}
          </div>
          {upcoming ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-[68px] rounded-2xl bg-brand-soft py-2.5 text-center text-[#07685f]">
                  <div className="text-[12.5px] font-semibold">{monthLabel(upcoming.date)}</div>
                  <div className="text-[28px] font-extrabold leading-[1.1]">{dayLabel(upcoming.date)}</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold">{upcoming.time}</div>
                  <div className="text-[14.5px]">{findDoctor(upcoming.doctorId)?.name}</div>
                  <div className="text-[13.5px] text-muted">{findDoctor(upcoming.doctorId)?.specialty}</div>
                </div>
              </div>
              <div className="rounded-xl bg-soft px-3 py-2.5 text-[13.5px] leading-normal text-muted">
                {upcoming.queueNo ? `Số thứ tự của bạn: ${upcoming.queueNo}. Vui lòng chờ gọi tên.` : 'Đến sớm 10 phút, báo lễ tân để được cấp số thứ tự.'}
              </div>
              <BtnLink to="/benh-nhan/lich-cua-toi" variant="light" size="sm">Xem chi tiết</BtnLink>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-soft px-3 py-4 text-sm text-muted">Bạn chưa có lịch khám nào sắp tới.</div>
              <BtnLink to="/benh-nhan/dat-lich" size="sm">Đặt lịch ngay</BtnLink>
            </>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        {tiles.map((t) => (
          <Link key={t.title} to={t.to} className="shadow-card flex flex-[1_1_200px] items-center gap-3.5 rounded-[18px] bg-white p-[18px] text-ink no-underline hover:-translate-y-0.5">
            <div style={{ background: t.color }} className="flex size-[50px] items-center justify-center rounded-[15px] text-white">
              <Icon name={t.icon} size={24} />
            </div>
            <div>
              <div className="text-[15.5px] font-bold">{t.title}</div>
              <div className="text-[13px] text-muted">{t.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[22px] font-extrabold">Tìm bác sĩ</div>
          <div className="flex flex-wrap gap-2">
            {['Tất cả', ...specialties].map((s) => (
              <Chip key={s} active={spec === s} onClick={() => setSpec(s)}>{s}</Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-[18px]">
          {shown.map((d, i) => (
            <Card key={d.id} className="flex max-w-[380px] flex-[1_1_250px] flex-col gap-3.5 p-[22px]">
              <div className="flex items-center gap-3.5">
                <div className={`flex size-[62px] items-center justify-center rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} text-2xl font-extrabold text-white`}>{initialOf(d.name)}</div>
                <div>
                  <div className="text-[17px] font-extrabold">{d.name}</div>
                  <Tag tone="info" className="mt-1">{d.specialty}</Tag>
                </div>
              </div>
              <div className="flex justify-between text-sm"><span className="text-muted">Giờ trống gần nhất</span><b>{nextFree(d.id)}</b></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Tiền khám</span><b>{money(d.price)}</b></div>
              <BtnLink to={`/benh-nhan/dat-lich?bacsi=${d.id}`} className="mt-auto">Đặt lịch với bác sĩ</BtnLink>
            </Card>
          ))}
          {shown.length === 0 && <div className="text-sm text-muted">Không tìm thấy bác sĩ phù hợp.</div>}
        </div>
      </div>
      <SampleNote />
    </>
  )
}
