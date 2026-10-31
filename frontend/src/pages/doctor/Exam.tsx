import { useState } from 'react'
import Icon from '../../components/Icon'
import { Avatar, Btn, Card, Chip, Empty, PageTitle, SampleNote, Tag } from '../../components/ui'
import { CURRENT_PATIENT_ID, medicines, pastVisits, TODAY } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { useMyDoctor } from '../../store/useMyDoctor'
import { initialOf } from '../../utils'
import type { Appointment, PrescriptionLine } from '../../types'

const rechecks = ['Không hẹn', '1 tuần', '2 tuần', '1 tháng']

export default function Exam() {
  const { appointments } = useClinic()
  const me = useMyDoctor()
  const queue = appointments
    .filter((a) => a.date === TODAY && a.doctorId === me.id && a.status === 'arrived')
    .sort((x, y) => (x.queueNo ?? 0) - (y.queueNo ?? 0))
  const [selId, setSelId] = useState<number | null>(null)
  const [notice, setNotice] = useState('')
  const current = queue.find((a) => a.id === selId) ?? queue[0]

  return (
    <>
      <PageTitle title="Khám bệnh" sub="Chọn bệnh nhân trong hàng chờ, ghi bệnh án, kê đơn và hẹn tái khám.">
        <Tag tone="info" className="!px-3.5 !py-2 !text-sm">{me.name} · {me.specialty}</Tag>
      </PageTitle>
      {notice && <div className="rounded-xl bg-[#dcf4e8] px-4 py-3 text-sm text-[#116a40]">{notice}</div>}
      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 max-w-[320px] flex-[1_1_250px] flex-col gap-2.5 p-[18px]">
          <div className="text-base font-bold">Hàng chờ của bác sĩ</div>
          {queue.length === 0 && <Empty>Chưa có bệnh nhân. Lễ tân cần xác nhận bệnh nhân đến trước.</Empty>}
          {queue.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setSelId(q.id)}
              className={`flex cursor-pointer items-center gap-3 rounded-[14px] border p-3 text-left ${current?.id === q.id ? 'border-[#9fd6cd] bg-[#e8f6f3]' : 'border-line bg-white'}`}
            >
              <div className="flex size-11 items-center justify-center rounded-[13px] bg-deep text-[19px] font-extrabold text-mint">{q.queueNo}</div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{q.patientName}</div>
                <div className="text-[13px] text-muted">{q.walkIn ? 'Khám vãng lai' : `Hẹn ${q.time}`}</div>
              </div>
              <Tag tone={current?.id === q.id ? 'info' : 'gray'}>{current?.id === q.id ? 'Đang khám' : 'Chờ'}</Tag>
            </button>
          ))}
        </Card>
        {current ? (
          <ExamForm
            key={current.id}
            appt={current}
            onDone={(msg) => { setNotice(msg); setSelId(null) }}
          />
        ) : (
          <Card className="flex-[3_1_520px] p-8 text-center text-muted">Không có bệnh nhân nào đang chờ khám.</Card>
        )}
      </div>
      <SampleNote />
    </>
  )
}

function ExamForm({ appt, onDone }: { appt: Appointment; onDone: (msg: string) => void }) {
  const { finishExam } = useClinic()
  const [symptom, setSymptom] = useState(appt.reason ?? '')
  const [diagnosis, setDiagnosis] = useState('')
  const [lines, setLines] = useState<PrescriptionLine[]>([])
  const [recheck, setRecheck] = useState('Không hẹn')
  const [pick, setPick] = useState(medicines[0].id)

  const last = pastVisits.find((v) => v.patientId === appt.patientId && appt.patientId === CURRENT_PATIENT_ID)

  const addDrug = () =>
    setLines((l) => (l.some((x) => x.medicineId === pick) ? l.map((x) => (x.medicineId === pick ? { ...x, qty: x.qty + 1 } : x)) : [...l, { medicineId: pick, qty: 1 }]))
  const changeQty = (id: number, delta: number) =>
    setLines((l) => l.map((x) => (x.medicineId === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x)))

  const finish = () => {
    finishExam(appt.id, { symptom, diagnosis, lines, recheck })
    onDone(
      lines.length
        ? `Đã lưu bệnh án cho ${appt.patientName}. Đơn thuốc đã chuyển cho dược sĩ, bệnh nhân sẽ đóng tiền ở thu ngân.`
        : `Đã lưu bệnh án cho ${appt.patientName}. Không có đơn thuốc nên chỉ thu tiền khám ở thu ngân.`,
    )
  }

  return (
    <div className="flex min-w-0 flex-[3_1_520px] flex-col gap-[18px]">
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <Avatar letter={initialOf(appt.patientName)} size={60} />
        <div className="min-w-[220px] flex-1">
          <div className="text-[21px] font-extrabold">{appt.patientName}</div>
          <div className="text-[14.5px] text-muted">{appt.phone} · Số thứ tự {appt.queueNo}{appt.walkIn ? ' · Khám vãng lai' : ''}</div>
        </div>
        <div className="rounded-xl bg-soft px-3.5 py-2.5 text-[13.5px] leading-normal">
          <div className="text-muted">Lần khám trước</div>
          <div className="font-semibold">{last ? `${last.date} · ${last.diagnosis.toLowerCase()}` : 'Chưa có (khám lần đầu)'}</div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5 p-5">
        <div className="text-[17px] font-bold">Bệnh án</div>
        <div className="flex flex-wrap gap-3.5">
          <label className="flex flex-[1_1_240px] flex-col gap-1.5 text-sm font-semibold">Triệu chứng
            <textarea value={symptom} onChange={(e) => setSymptom(e.target.value)} rows={3} className="rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 py-3 text-[15px] font-normal" />
          </label>
          <label className="flex flex-[1_1_240px] flex-col gap-1.5 text-sm font-semibold">Chẩn đoán, kết quả khám
            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} placeholder="Nhập chẩn đoán..." className="rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 py-3 text-[15px] font-normal" />
          </label>
        </div>
      </Card>

      <div className="flex flex-col gap-[18px]">
        <Card className="flex min-w-0 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="text-[17px] font-bold">Đơn thuốc</div>
            <div className="flex gap-2">
              <select value={pick} onChange={(e) => setPick(Number(e.target.value))} className="min-h-[38px] rounded-[10px] border border-[#cfe2df] bg-white px-2.5 text-sm">
                {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <Btn variant="light" size="sm" onClick={addDrug}><Icon name="plus" size={17} strokeWidth={2.6} /> Thêm</Btn>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {lines.map((l) => {
              const m = medicines.find((x) => x.id === l.medicineId)!
              return (
                <div key={l.medicineId} className="flex items-center gap-3 rounded-xl bg-soft px-3.5 py-2.5">
                  <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-brand-soft text-[#07685f]"><Icon name="pill" size={18} /></div>
                  <div className="flex-1 text-[14.5px] font-semibold">{m.name}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => changeQty(l.medicineId, -1)} className="size-8 cursor-pointer rounded-lg border border-[#cfe2df] bg-white font-bold">−</button>
                    <span className="min-w-[56px] text-center text-sm font-semibold">{l.qty} {m.unit}</span>
                    <button type="button" onClick={() => changeQty(l.medicineId, 1)} className="size-8 cursor-pointer rounded-lg border border-[#cfe2df] bg-white font-bold">+</button>
                  </div>
                  <Btn variant="danger" size="sm" onClick={() => setLines((x) => x.filter((y) => y.medicineId !== l.medicineId))}>Bỏ</Btn>
                </div>
              )
            })}
            {lines.length === 0 && <div className="text-sm text-muted">Chưa kê thuốc. Nếu không kê thì chỉ thu tiền khám.</div>}
          </div>
        </Card>
        <Card className="flex min-w-0 flex-col gap-3 p-5">
          <div className="text-[17px] font-bold">Hẹn tái khám</div>
          <div className="flex flex-wrap gap-2">
            {rechecks.map((r) => <Chip key={r} dark={false} active={recheck === r} onClick={() => setRecheck(r)}>{r}</Chip>)}
          </div>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-3.5 px-5 py-[18px]">
        <Btn onClick={finish}>Hoàn tất khám</Btn>
        <div className="min-w-[260px] flex-1 text-[14.5px] text-muted">Bấm khi khám xong. Bệnh án được lưu và đơn thuốc (nếu có) chuyển cho dược sĩ.</div>
      </Card>
    </div>
  )
}
