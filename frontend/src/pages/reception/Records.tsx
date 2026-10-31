import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { Avatar, Btn, Card, Empty, PageTitle, SampleNote, Tag } from '../../components/ui'
import { useClinic } from '../../store/useClinic'
import { initialOf, lineText, money } from '../../utils'

interface PatientGroup {
  key: string
  name: string
  phone: string
  doctorId: number
  visitCount: number
  latestStatus: string
  latestTime: string
  latestQueueNo: number | null
  historyIds: number[]
}

export default function Records() {
  const { appointments, prescriptions, doctorsList, medicinesList, addWalkIn } = useClinic()
  const navigate = useNavigate()
  const [kw, setKw] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [quickDoctorId, setQuickDoctorId] = useState<number>(doctorsList[0]?.id ?? 1)
  const [quickReason, setQuickReason] = useState('Tái khám / Kiểm tra sức khỏe')

  // Gom nhóm theo từng bệnh nhân (tránh bị trùng nhiều dòng khi 1 người khám nhiều lần)
  const map = new Map<string, PatientGroup>()
  appointments.forEach((a) => {
    const key = `${a.patientName.trim().toLowerCase()}_${a.phone.trim()}`
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        key,
        name: a.patientName,
        phone: a.phone,
        doctorId: a.doctorId,
        visitCount: 1,
        latestStatus: a.status,
        latestTime: a.time,
        latestQueueNo: a.queueNo,
        historyIds: [a.id],
      })
    } else {
      existing.visitCount += 1
      existing.doctorId = a.doctorId
      existing.latestStatus = a.status
      existing.latestTime = a.time
      existing.latestQueueNo = a.queueNo
      existing.historyIds.push(a.id)
    }
  })

  const patients = [...map.values()].filter((p) =>
    (p.name + p.phone).toLowerCase().includes(kw.trim().toLowerCase()),
  )

  const current = patients.find((p) => p.key === selectedKey) ?? patients[0]
  const patientVisits = current
    ? appointments.filter((a) => current.historyIds.includes(a.id)).reverse()
    : []
  const nextNo = appointments.reduce((m, a) => Math.max(m, a.queueNo ?? 0), 0) + 1

  const handleQuickRevisit = () => {
    if (!current) return
    addWalkIn(current.name, current.phone, quickDoctorId, quickReason)
    navigate('/le-tan')
  }

  return (
    <>
      <PageTitle
        title="Hồ sơ bệnh nhân"
        sub="Tra cứu thông tin hành chính, lịch sử các lần khám của bệnh nhân và hỗ trợ đăng ký tái khám nhanh."
      />

      <div className="flex flex-wrap items-start gap-[22px]">
        {/* Cột trái: Danh sách bệnh nhân duy nhất (không trùng lặp) */}
        <Card className="flex min-w-0 flex-[1.3_1_440px] flex-col gap-3.5 p-5">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold">Danh sách hồ sơ ({patients.length} bệnh nhân)</div>
          </div>

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
            {patients.length === 0 && <Empty>Không tìm thấy hồ sơ bệnh nhân.</Empty>}
            {patients.map((p) => {
              const active = current?.key === p.key
              const lastDoc = doctorsList.find((d) => d.id === p.doctorId)
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setSelectedKey(p.key)
                    setQuickDoctorId(p.doctorId)
                  }}
                  className={`flex w-full cursor-pointer flex-wrap items-center gap-3.5 rounded-[14px] border px-4 py-3.5 text-left transition ${active ? 'border-brand bg-[#e8f6f3]' : 'border-transparent bg-soft hover:border-[#cfe2df]'
                    }`}
                >
                  <Avatar letter={initialOf(p.name)} />
                  <div className="min-w-0 flex-[1_1_180px]">
                    <div className="font-bold text-ink">{p.name}</div>
                    <div className="text-[13px] text-muted">
                      SĐT: {p.phone} · BS gần nhất: {lastDoc?.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.latestStatus === 'arrived' ? (
                      <Tag tone="ok">Đã đến · Số {p.latestQueueNo}</Tag>
                    ) : p.latestStatus === 'done' ? (
                      <Tag tone="info">Đã khám ({p.visitCount} lần)</Tag>
                    ) : (
                      <Tag tone="wait">Hẹn {p.latestTime}</Tag>
                    )}
                    <span className="text-[12px] text-muted">Tổng: {p.visitCount} lượt khám</span>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Cột phải: Chi tiết hồ sơ bệnh nhân & Lịch sử khám */}
        {current && (
          <Card className="flex min-w-0 flex-[1_1_380px] flex-col gap-4 border-[1.5px] border-brand p-5">
            <div className="flex items-center gap-3.5 border-b border-line pb-3.5">
              <Avatar letter={initialOf(current.name)} size={52} />
              <div className="min-w-0 flex-1">
                <div className="text-[19px] font-extrabold text-ink">{current.name}</div>
                <div className="text-[13.5px] text-muted">
                  Số điện thoại: <b className="text-ink">{current.phone}</b> · Tổng số lần khám: <b>{current.visitCount}</b>
                </div>
              </div>
            </div>

            {/* Lịch sử các lần khám của bệnh nhân này */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-bold text-ink">Lịch sử khám &amp; đặt hẹn tại phòng khám</div>
              <div className="flex max-h-[240px] flex-col gap-2 overflow-y-auto pr-1">
                {patientVisits.map((v) => {
                  const doc = doctorsList.find((d) => d.id === v.doctorId)
                  const rx = prescriptions.find((r) => r.appointmentId === v.id)
                  return (
                    <div key={v.id} className="rounded-xl bg-soft p-3 text-[13px]">
                      <div className="flex items-center justify-between font-bold text-ink">
                        <span>{v.date} ({v.time}) · {doc?.name}</span>
                        <Tag tone={v.status === 'done' ? 'info' : v.status === 'arrived' ? 'ok' : 'wait'}>
                          {v.status === 'done' ? 'Đã khám' : v.status === 'arrived' ? `Số #${v.queueNo}` : 'Đã đặt'}
                        </Tag>
                      </div>
                      <div className="mt-1 text-muted">
                        Chuyên khoa: {doc?.specialty} · Lý do/Triệu chứng: {v.symptom || v.reason || 'Khám tổng quát'}
                      </div>
                      {v.diagnosis && (
                        <div className="mt-0.5 font-semibold text-brand">Chẩn đoán: {v.diagnosis}</div>
                      )}
                      {rx && rx.lines.length > 0 && (
                        <div className="mt-0.5 text-ink">
                          Đơn thuốc: {rx.lines.map((l) => lineText(l, medicinesList)).join(', ')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cấp số tái khám nhanh từ hồ sơ cũ (không cần gõ lại Họ tên & SĐT) */}
            <div className="flex flex-col gap-3 rounded-2xl bg-[#f4fbf8] p-4 border border-[#cdeadf]">
              <div className="text-sm font-bold text-[#07685f]">
                Cấp số khám mới từ hồ sơ này (Không cần nhập lại tên/SĐT)
              </div>
              <label className="flex flex-col gap-1 text-[12.5px] font-bold">
                Chọn Bác sĩ khám hôm nay
                <select
                  value={quickDoctorId}
                  onChange={(e) => setQuickDoctorId(Number(e.target.value))}
                  className="min-h-10 rounded-xl border border-[#cfe2df] bg-white px-3 text-sm font-semibold"
                >
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.specialty} - {d.name} ({money(d.price)})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[12.5px] font-bold">
                Lý do khám lần này
                <input
                  value={quickReason}
                  onChange={(e) => setQuickReason(e.target.value)}
                  className="min-h-10 rounded-xl border border-[#cfe2df] bg-white px-3 text-sm font-normal"
                />
              </label>
              <Btn size="sm" onClick={handleQuickRevisit}>
                Cấp ngay số #{nextNo} cho {current.name}
              </Btn>
            </div>
          </Card>
        )}
      </div>
      <SampleNote />
    </>
  )
}