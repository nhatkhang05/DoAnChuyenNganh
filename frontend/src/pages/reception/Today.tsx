import { useState } from 'react'
import Icon from '../../components/Icon'
import { Avatar, Btn, Card, Chip, Empty, PageTitle, SampleNote, Tag } from '../../components/ui'
import { doctors, TODAY } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { findDoctor, initialOf } from '../../utils'

type Tab = 'all' | 'wait' | 'in'

export default function Today() {
  const { appointments, confirmArrival, addWalkIn } = useClinic()
  const [tab, setTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [doctorId, setDoctorId] = useState(doctors[0].id)

  const today = appointments.filter((a) => a.date === TODAY)
  const arrived = today.filter((a) => a.status === 'arrived' || a.status === 'done')
  const waiting = today.filter((a) => a.status === 'booked')
  const nextNo = appointments.reduce((m, a) => Math.max(m, a.queueNo ?? 0), 0) + 1

  const rows = today.filter((a) => tab === 'all' || (tab === 'wait' && a.status === 'booked') || (tab === 'in' && (a.status === 'arrived' || a.status === 'done')))
  const queue = today.filter((a) => a.status === 'arrived').sort((x, y) => (x.queueNo ?? 0) - (y.queueNo ?? 0))

  const cards = [
    { label: 'Lịch hẹn hôm nay', value: String(today.length), bg: '#e0f3f0', fg: '#07685f' },
    { label: 'Bệnh nhân đã đến', value: String(arrived.length), bg: '#dcf4e8', fg: '#116a40' },
    { label: 'Còn chờ đến', value: String(waiting.length), bg: '#fdf0d5', fg: '#7a4d00' },
    { label: 'Số thứ tự kế tiếp', value: '#' + nextNo, bg: '#e0eefa', fg: '#1b4d78' },
  ]

  const submitWalkIn = () => {
    if (!name.trim()) return
    addWalkIn(name.trim(), phone.trim() || '—', doctorId)
    setName(''); setPhone(''); setShowForm(false)
  }

  return (
    <>
      <PageTitle title="Lịch khám hôm nay" sub="Bệnh nhân đến thì bấm xác nhận, hệ thống cấp số thứ tự ngay.">
        <Btn onClick={() => setShowForm((v) => !v)}><Icon name="plus" size={19} strokeWidth={2.6} /> Đăng ký khám vãng lai</Btn>
      </PageTitle>

      {showForm && (
        <Card className="flex flex-wrap items-end gap-3.5 p-5">
          <label className="flex flex-[1_1_200px] flex-col gap-1.5 text-sm font-semibold">Họ tên bệnh nhân
            <input value={name} onChange={(e) => setName(e.target.value)} className="min-h-12 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[15px] font-normal" />
          </label>
          <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-sm font-semibold">Số điện thoại
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="min-h-12 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[15px] font-normal" />
          </label>
          <label className="flex flex-[1_1_200px] flex-col gap-1.5 text-sm font-semibold">Bác sĩ khám
            <select value={doctorId} onChange={(e) => setDoctorId(Number(e.target.value))} className="min-h-12 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3 text-[15px] font-normal">
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} – {d.specialty}</option>)}
            </select>
          </label>
          <Btn disabled={!name.trim()} onClick={submitWalkIn}>Cấp số #{nextNo}</Btn>
        </Card>
      )}

      <div className="flex flex-wrap gap-3.5">
        {cards.map((c) => (
          <Card key={c.label} className="flex flex-[1_1_190px] items-center gap-3.5 px-5 py-[18px]">
            <div style={{ background: c.bg, color: c.fg }} className="flex size-12 items-center justify-center rounded-[14px] text-xl font-extrabold">{c.value}</div>
            <div className="text-sm leading-snug text-muted">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 flex-[3_1_520px] flex-col gap-3.5 p-5">
          <div className="flex flex-wrap gap-2">
            <Chip active={tab === 'all'} onClick={() => setTab('all')}>Tất cả</Chip>
            <Chip active={tab === 'wait'} onClick={() => setTab('wait')}>Chờ đến</Chip>
            <Chip active={tab === 'in'} onClick={() => setTab('in')}>Đã đến</Chip>
          </div>
          <div className="flex flex-col gap-2.5">
            {rows.length === 0 && <Empty>Không có lịch nào.</Empty>}
            {rows.map((a) => {
              const d = findDoctor(a.doctorId)
              const here = a.status === 'arrived' || a.status === 'done'
              return (
                <div key={a.id} className={`flex flex-wrap items-center gap-3.5 rounded-[14px] border px-4 py-3.5 ${here ? 'border-[#cdeadf] bg-[#f4fbf8]' : 'border-line bg-white'}`}>
                  <div className="w-[70px] text-[17px] font-bold text-[#07685f]">{a.time}</div>
                  <Avatar letter={initialOf(a.patientName)} />
                  <div className="min-w-0 flex-[1_1_180px]">
                    <div className="flex items-center gap-2 text-[15.5px] font-bold">{a.patientName}{a.walkIn && <Tag tone="gray">Vãng lai</Tag>}</div>
                    <div className="text-[13.5px] text-muted">{d?.name} · {d?.specialty} · {a.phone}</div>
                  </div>
                  {a.status === 'cancelled' ? <Tag tone="no">Đã hủy</Tag>
                    : a.status === 'done' ? <Tag tone="gray">Đã khám xong</Tag>
                    : here ? <Tag tone="ok">Đã đến · số {a.queueNo}</Tag>
                    : <Tag tone="wait">Đã đặt</Tag>}
                  <Btn size="sm" disabled={a.status !== 'booked'} onClick={() => confirmArrival(a.id)}>
                    {a.status === 'booked' ? 'Xác nhận đến' : a.status === 'cancelled' ? 'Đã hủy' : 'Đã cấp số'}
                  </Btn>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="flex min-w-0 flex-[1_1_280px] flex-col gap-3.5 !bg-deep p-5 text-white">
          <div>
            <div className="text-[17px] font-bold">Hàng chờ khám</div>
            <div className="text-[13.5px] text-[#a9d3ce]">Theo số thứ tự đã cấp</div>
          </div>
          {queue.map((q) => (
            <div key={q.id} className="flex items-center gap-3.5 rounded-[14px] bg-deep-2 px-3.5 py-3">
              <div className="flex size-[46px] items-center justify-center rounded-[13px] bg-mint text-xl font-extrabold text-deep">{q.queueNo}</div>
              <div className="min-w-0">
                <div className="font-semibold">{q.patientName}</div>
                <div className="text-[13px] text-[#a9d3ce]">{findDoctor(q.doctorId)?.name}</div>
              </div>
            </div>
          ))}
          {queue.length === 0 && <div className="text-[13px] text-[#a9d3ce]">Chưa có ai đang chờ.</div>}
        </Card>
      </div>
      <SampleNote />
    </>
  )
}
