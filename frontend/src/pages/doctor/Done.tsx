import { useState } from 'react'
import { Btn, Card, PageTitle, SampleNote, Tag } from '../../components/ui'
import { useClinic } from '../../store/useClinic'
import { lineText } from '../../utils'

interface CompletedRecord {
  id: number
  queueNo: number
  patientName: string
  time: string
  phone: string
  specialtyInfo: string
  symptom: string
  diagnosis: string
  medicines: string[]
  recheckLabel: string
  recheckDetail: string
}

const seedCompleted: CompletedRecord[] = [
  {
    id: 101,
    queueNo: 2,
    patientName: 'Bé Phạm Gia Hân',
    time: '08:00',
    phone: '0987 654 321',
    specialtyInfo: 'Chuyên khoa: Nhi',
    symptom: 'Ho khan, sốt nhẹ 37.8°C',
    diagnosis: 'Viêm đường hô hấp trên',
    medicines: ['Thuốc ho (mẫu) x 1 chai', 'Vitamin C (mẫu) x 1 tuýp'],
    recheckLabel: '1 tuần',
    recheckDetail: 'Hẹn tái khám sau 1 tuần (02/11/2026)',
  },
  {
    id: 102,
    queueNo: 1,
    patientName: 'Trần Thị Bích',
    time: '08:30',
    phone: '0903 111 222',
    specialtyInfo: 'BS. Nguyễn Minh Anh (Nội tổng quát)',
    symptom: 'Đau rát họng, ho 3 ngày',
    diagnosis: 'Viêm họng cấp',
    medicines: ['Thuốc ho (mẫu) x 1 chai', 'Thuốc ngậm họng (mẫu) x 2 vỉ'],
    recheckLabel: '2 tuần',
    recheckDetail: 'Hẹn tái khám sau 2 tuần (09/11/2026)',
  },
]

export default function Done() {
  const { appointments, prescriptions, doctorsList, medicinesList } = useClinic()
  const [records, setRecords] = useState<CompletedRecord[]>(seedCompleted)
  const [editing, setEditing] = useState<CompletedRecord | null>(null)

  const dynamicDone: CompletedRecord[] = appointments
    .filter((a) => a.status === 'done')
    .map((a) => {
      const doc = doctorsList.find((d) => d.id === a.doctorId)
      const rx = prescriptions.find((p) => p.appointmentId === a.id)
      return {
        id: a.id,
        queueNo: a.queueNo ?? 1,
        patientName: a.patientName,
        time: a.time,
        phone: a.phone,
        specialtyInfo: `${doc?.name ?? 'Bác sĩ'} (${doc?.specialty ?? 'Nội tổng quát'})`,
        symptom: a.symptom || 'Đau rát họng, ho khan',
        diagnosis: a.diagnosis || 'Viêm họng cấp',
        medicines: rx && rx.lines.length > 0 ? rx.lines.map((l) => lineText(l, medicinesList)) : ['Không kê thuốc'],
        recheckLabel: a.recheck || '1 tuần',
        recheckDetail: a.recheck && a.recheck !== 'Không hẹn' ? `Hẹn tái khám sau ${a.recheck}` : 'Không hẹn tái khám',
      }
    })

  const allRecords = [
    ...dynamicDone,
    ...records.filter((r) => !dynamicDone.some((d) => d.patientName === r.patientName)),
  ]

  const saveEdit = () => {
    if (!editing) return
    setRecords((prev) => prev.map((r) => (r.id === editing.id ? editing : r)))
    setEditing(null)
  }

  return (
    <>
      <PageTitle
        title="Đã khám hôm nay"
        sub="Các bệnh nhân bác sĩ đã khám xong trong ngày kèm hồ sơ bệnh án và đơn thuốc đã lưu."
      />

      {editing && (
        <Card className="flex flex-wrap items-end gap-3.5 border-2 border-brand p-5">
          <label className="flex flex-[1_1_220px] flex-col gap-1.5 text-sm font-semibold">
            Triệu chứng ({editing.patientName})
            <input
              value={editing.symptom}
              onChange={(e) => setEditing({ ...editing, symptom: e.target.value })}
              className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal"
            />
          </label>
          <label className="flex flex-[1_1_220px] flex-col gap-1.5 text-sm font-semibold">
            Chẩn đoán
            <input
              value={editing.diagnosis}
              onChange={(e) => setEditing({ ...editing, diagnosis: e.target.value })}
              className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal"
            />
          </label>
          <label className="flex flex-[1_1_220px] flex-col gap-1.5 text-sm font-semibold">
            Chỉ định tái khám
            <input
              value={editing.recheckDetail}
              onChange={(e) => setEditing({ ...editing, recheckDetail: e.target.value })}
              className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal"
            />
          </label>
          <Btn size="sm" onClick={saveEdit}>Lưu cập nhật</Btn>
        </Card>
      )}

      <div className="flex flex-col gap-5">
        {allRecords.map((rec) => (
          <Card key={rec.id} className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-[12px] bg-deep text-base font-extrabold text-white">
                  {rec.queueNo}
                </div>
                <div>
                  <div className="text-[17px] font-bold">{rec.patientName}</div>
                  <div className="text-[13.5px] text-muted">
                    Khám lúc {rec.time} · SĐT: {rec.phone} · {rec.specialtyInfo}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">Tái khám: {rec.recheckLabel}</span>
                <Tag tone="ok">Đã khám xong</Tag>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-[14px] bg-soft p-4">
                <div className="mb-2 text-[13px] font-semibold text-muted">Triệu chứng &amp; Chẩn đoán</div>
                <div className="mb-1.5 text-sm">Triệu chứng: {rec.symptom}</div>
                <div className="text-sm font-bold text-brand">Chẩn đoán: {rec.diagnosis}</div>
              </div>

              <div className="rounded-[14px] bg-soft p-4">
                <div className="mb-2 text-[13px] font-semibold text-muted">
                  Đơn thuốc đã kê ({rec.medicines.length} loại)
                </div>
                {rec.medicines.map((m, idx) => (
                  <div key={idx} className="mb-1 text-sm font-bold">• {m}</div>
                ))}
              </div>

              <div className="rounded-[14px] bg-soft p-4">
                <div className="mb-2 text-[13px] font-semibold text-muted">Chỉ định &amp; Lịch hẹn tái khám</div>
                <div className="mb-3 text-sm font-bold">{rec.recheckDetail}</div>
                <button
                  type="button"
                  onClick={() => setEditing(rec)}
                  className="cursor-pointer rounded-lg border border-[#cfe2df] bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-brand hover:bg-brand-soft"
                >
                  Cập nhật bệnh án
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <SampleNote />
    </>
  )
}