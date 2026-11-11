import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { Avatar, Btn, Card, Empty, PageTitle, SampleNote, Tag } from '../../components/ui'
import { TODAY } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { initialOf, lineText, money } from '../../utils'

interface PatientGroup {
  key: string
  name: string
  phone: string
  patientId: string | null
  doctorId: number
  visitCount: number
  latestStatus: string
  latestTime: string
  latestQueueNo: number | null
  latestReason: string
  historyIds: number[]
}

export default function HoSo() {
  const { appointments, prescriptions, doctorsList, medicinesList, confirmArrival, addWalkIn, updatePatientProfile } = useClinic()
  const navigate = useNavigate()
  const [kw, setKw] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // State chỉnh sửa hồ sơ & lịch hẹn liên kết trực tiếp
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editDoctorId, setEditDoctorId] = useState<number>(doctorsList[0]?.id ?? 1)
  const [editReason, setEditReason] = useState('')
  const [savedNotice, setSavedNotice] = useState('')

  // Gom nhóm hồ sơ theo từng bệnh nhân
  const map = new Map<string, PatientGroup>()
  appointments.forEach((a) => {
    const key = a.patientId ? `pid_${a.patientId}` : `${a.patientName.trim().toLowerCase()}_${a.phone.trim()}`
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        key,
        name: a.patientName,
        phone: a.phone,
        patientId: a.patientId,
        doctorId: a.doctorId,
        visitCount: 1,
        latestStatus: a.status,
        latestTime: a.time,
        latestQueueNo: a.queueNo,
        latestReason: a.reason || '',
        historyIds: [a.id],
      })
    } else {
      existing.visitCount += 1
      existing.name = a.patientName
      existing.phone = a.phone
      existing.doctorId = a.doctorId
      existing.latestStatus = a.status
      existing.latestTime = a.time
      existing.latestQueueNo = a.queueNo
      existing.latestReason = a.reason || existing.latestReason
      existing.historyIds.push(a.id)
    }
  })

  const patients = [...map.values()].filter((p) =>
    (p.name + p.phone).toLowerCase().includes(kw.trim().toLowerCase()),
  )

  const current = patients.find((p) => p.key === selectedKey) ?? patients[0]

  // Đồng bộ form bên phải mỗi khi chọn bệnh nhân khác ở danh sách bên trái
  useEffect(() => {
    if (!current) return
    setEditName(current.name)
    setEditPhone(current.phone)
    setEditDoctorId(current.doctorId)
    setEditReason(current.latestReason || 'Khám kiểm tra sức khỏe')
    setSavedNotice('')
  }, [current?.key])

  const patientVisits = current
    ? appointments.filter((a) => current.historyIds.includes(a.id)).reverse()
    : []

  // Kiểm tra xem bệnh nhân này hôm nay có lịch đang chờ đến hoặc đã cấp số chưa
  const todayBookedAppt = current
    ? appointments.find((a) => current.historyIds.includes(a.id) && a.date === TODAY && a.status === 'booked')
    : undefined
  const todayArrivedAppt = current
    ? appointments.find((a) => current.historyIds.includes(a.id) && a.date === TODAY && a.status === 'arrived')
    : undefined

  const nextNo = appointments.reduce((m, a) => Math.max(m, a.queueNo ?? 0), 0) + 1

  const handleSaveProfile = () => {
    if (!current || !editName.trim()) return
    updatePatientProfile(current.name, current.phone, editName, editPhone, editDoctorId, editReason)
    setSavedNotice('Đã lưu cập nhật hồ sơ và đồng bộ sang Lịch khám hôm nay!')
  }

  const handleQueueAction = () => {
    if (!current) return
    // Lưu thông tin vừa sửa trước khi cấp số
    updatePatientProfile(current.name, current.phone, editName, editPhone, editDoctorId, editReason)
    if (todayBookedAppt) {
      confirmArrival(todayBookedAppt.id)
    } else if (!todayArrivedAppt) {
      addWalkIn(editName, editPhone, editDoctorId, editReason, current.patientId)
    }
    navigate('/le-tan')
  }

  return (
    <>
      <PageTitle
        title="Hồ sơ bệnh nhân"
        sub="Tra cứu, chỉnh sửa thông tin hành chính và đồng bộ trực tiếp với Lịch khám hôm nay."
      />

      <div className="flex flex-wrap items-start gap-[22px]">
        {/* Cột trái: Danh sách hồ sơ bệnh nhân */}
        <Card className="flex min-w-0 flex-[1.25_1_420px] flex-col gap-3.5 p-5">
          <div className="text-base font-bold">Danh sách hồ sơ ({patients.length} bệnh nhân)</div>

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
                  onClick={() => setSelectedKey(p.key)}
                  className={`flex w-full cursor-pointer flex-wrap items-center gap-3.5 rounded-[14px] border px-4 py-3.5 text-left transition ${active ? 'border-brand bg-[#e8f6f3]' : 'border-transparent bg-soft hover:border-[#cfe2df]'
                    }`}
                >
                  <Avatar letter={initialOf(p.name)} />
                  <div className="min-w-0 flex-[1_1_180px]">
                    <div className="font-bold text-ink">{p.name}</div>
                    <div className="text-[13px] text-muted">
                      SĐT: {p.phone} · {lastDoc?.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.latestStatus === 'arrived' ? (
                      <Tag tone="ok">Đã đến · Số {p.latestQueueNo}</Tag>
                    ) : p.latestStatus === 'done' ? (
                      <Tag tone="info">Đã khám xong</Tag>
                    ) : (
                      <Tag tone="wait">Đã đặt {p.latestTime}</Tag>
                    )}
                    <span className="text-[12px] text-muted">Tổng: {p.visitCount} lượt khám</span>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Cột phải: Chỉnh sửa hồ sơ & Lịch sử khám liên kết chặt chẽ */}
        {current && (
          <Card className="flex min-w-0 flex-[1_1_380px] flex-col gap-4 border-[1.5px] border-brand p-5">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3.5">
              <div className="flex items-center gap-3">
                <Avatar letter={initialOf(editName || current.name)} size={50} />
                <div>
                  <div className="text-[18px] font-extrabold text-ink">{editName || current.name}</div>
                  <div className="text-[13px] text-muted">
                    Mã hồ sơ: <b>{current.patientId ?? `BN-0${current.historyIds[0]}`}</b> · {current.visitCount} lần khám
                  </div>
                </div>
              </div>
              {todayArrivedAppt ? (
                <Tag tone="ok">Đang chờ khám · Số #{todayArrivedAppt.queueNo}</Tag>
              ) : todayBookedAppt ? (
                <Tag tone="wait">Hẹn hôm nay {todayBookedAppt.time}</Tag>
              ) : null}
            </div>

            {savedNotice && (
              <div className="rounded-xl bg-[#dcf4e8] px-3.5 py-2.5 text-[13px] font-semibold text-[#116a40]">
                ✓ {savedNotice}
              </div>
            )}

            {/* Form chỉnh sửa thông tin hành chính đồng bộ sang Lịch khám hôm nay & Bệnh nhân */}
            <div className="flex flex-col gap-3 rounded-2xl border border-[#cfe2df] bg-[#f8fbfa] p-4">
              <div className="text-sm font-bold text-ink">Thông tin hành chính &amp; Lịch khám hiện tại</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-[12.5px] font-bold">
                  Họ và tên bệnh nhân
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="min-h-10 rounded-xl border border-[#cfe2df] bg-white px-3 text-sm font-semibold"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[12.5px] font-bold">
                  Số điện thoại
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="min-h-10 rounded-xl border border-[#cfe2df] bg-white px-3 text-sm font-semibold"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-[12.5px] font-bold">
                Bác sĩ phụ trách khám
                <select
                  value={editDoctorId}
                  onChange={(e) => setEditDoctorId(Number(e.target.value))}
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
                Lý do khám / Triệu chứng
                <input
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="min-h-10 rounded-xl border border-[#cfe2df] bg-white px-3 text-sm font-normal"
                />
              </label>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <Btn size="sm" variant="light" onClick={handleSaveProfile}>
                  Lưu cập nhật hồ sơ
                </Btn>

                {todayArrivedAppt ? (
                  <Btn size="sm" disabled>
                    Đã cấp số #{todayArrivedAppt.queueNo} trong hàng chờ
                  </Btn>
                ) : todayBookedAppt ? (
                  <Btn size="sm" onClick={handleQueueAction}>
                    Xác nhận đến &amp; Cấp số #{nextNo}
                  </Btn>
                ) : (
                  <Btn size="sm" onClick={handleQueueAction}>
                    Đăng ký tái khám &amp; Cấp số #{nextNo}
                  </Btn>
                )}
              </div>
            </div>

            {/* Lịch sử các lần khám của bệnh nhân */}
            <div className="flex flex-col gap-2">
              <div className="text-sm font-bold text-ink">Lịch sử khám tại phòng khám</div>
              <div className="flex max-h-[210px] flex-col gap-2 overflow-y-auto pr-1">
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
                        Chuyên khoa: {doc?.specialty} · Lý do: {v.symptom || v.reason || 'Khám tổng quát'}
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
          </Card>
        )}
      </div>
      <SampleNote />
    </>
  )
}