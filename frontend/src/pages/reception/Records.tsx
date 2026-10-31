import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { Avatar, Btn, Card, Empty, PageTitle, SampleNote, Tag } from '../../components/ui'
import { useClinic } from '../../store/useClinic'
import { initialOf, money } from '../../utils'

export default function Records() {
  const { appointments, doctorsList, addWalkIn } = useClinic()
  const navigate = useNavigate()
  const [kw, setKw] = useState('')
  const [name, setName] = useState('Đỗ Quang Huy')
  const [phone, setPhone] = useState('0944 555 666  ·  Năm sinh: 1997')
  const [doctorId, setDoctorId] = useState(1)
  const [reason, setReason] = useState('Đau đầu, sốt nhẹ từ tối qua...')

  const nextNo = appointments.reduce((m, a) => Math.max(m, a.queueNo ?? 0), 0) + 1
  const list = appointments.filter((p) => (p.patientName + p.phone).toLowerCase().includes(kw.trim().toLowerCase()))

  const submitWalkIn = () => {
    if (!name.trim()) return
    const cleanPhone = phone.split('·')[0].trim() || '0944 555 666'
    addWalkIn(name.trim(), cleanPhone, doctorId, reason)
    navigate('/le-tan')
  }

  return (
    <>
      <PageTitle
        title="Hồ sơ bệnh nhân"
        sub="Tra cứu hồ sơ bệnh nhân theo tên, số điện thoại hoặc đăng ký khám vãng lai tại quầy."
      />

      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 flex-[3_1_480px] flex-col gap-3.5 p-5">
          <div className="text-base font-bold">Danh sách hồ sơ bệnh nhân</div>
          <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-muted">
            <Icon name="search" size={18} />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="Tìm theo họ tên hoặc số điện thoại bệnh nhân..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-0"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            {list.length === 0 && <Empty>Không tìm thấy bệnh nhân.</Empty>}
            {list.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3.5 rounded-[14px] bg-soft px-4 py-3.5">
                <Avatar letter={initialOf(p.patientName)} />
                <div className="min-w-0 flex-[1_1_200px]">
                  <div className="font-bold">{p.patientName}</div>
                  <div className="text-[13px] text-muted">{p.phone} · BS gần nhất: {doctorsList.find((d) => d.id === p.doctorId)?.name}</div>
                </div>
                {p.status === 'arrived' ? (
                  <Tag tone="ok">Đã đến · Số {p.queueNo}</Tag>
                ) : p.status === 'done' ? (
                  <Tag tone="info">Đã khám xong</Tag>
                ) : (
                  <Tag tone="wait">Đã đặt {p.time}</Tag>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex min-w-0 flex-[2_1_340px] flex-col gap-3.5 border-[1.5px] border-brand p-5">
          <div>
            <div className="text-[18px] font-bold">Đăng ký khám tại quầy</div>
            <div className="text-[13px] text-muted">Tạo hồ sơ nhanh và cấp số thứ tự vào hàng chờ.</div>
          </div>

          <label className="flex flex-col gap-1 text-[13px] font-bold">
            Họ và tên bệnh nhân
            <input value={name} onChange={(e) => setName(e.target.value)} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>

          <label className="flex flex-col gap-1 text-[13px] font-bold">
            Số điện thoại &amp; Năm sinh
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>

          <label className="flex flex-col gap-1 text-[13px] font-bold">
            Chọn Chuyên khoa &amp; Bác sĩ
            <select value={doctorId} onChange={(e) => setDoctorId(Number(e.target.value))} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3 text-sm font-semibold">
              {doctorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.specialty} - {d.name} ({money(d.price)})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[13px] font-bold">
            Triệu chứng / Lý do khám
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>

          <div className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-3.5 py-2.5 text-center text-[13px] font-bold text-[#116a40]">
            Số thứ tự cấp ngay: #{nextNo} ({doctorsList.find((d) => d.id === doctorId)?.name})
          </div>

          <Btn onClick={submitWalkIn}>Xác nhận &amp; Cấp số thứ tự (#{nextNo})</Btn>
        </Card>
      </div>
      <SampleNote />
    </>
  )
}