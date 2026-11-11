import { useState } from 'react'
import { Btn, Card, PageTitle, SampleNote } from '../../components/ui'
import { specialties } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { money } from '../../utils'

export default function DanhMuc() {
  const { doctorsList, medicinesList, saveDoctor, saveMedicine } = useClinic()
  const [formBacSi, setFormBacSi] = useState<{ id?: number; name: string; specialty: string; price: string } | null>(null)
  const [formThuoc, setFormThuoc] = useState<{ id?: number; name: string; unit: string; price: string } | null>(null)

  const luuBacSi = () => {
    if (!formBacSi || !formBacSi.name.trim()) return
    saveDoctor({ id: formBacSi.id, name: formBacSi.name.trim(), specialty: formBacSi.specialty, price: Number(formBacSi.price) || 50000 })
    setFormBacSi(null)
  }

  const luuThuoc = () => {
    if (!formThuoc || !formThuoc.name.trim()) return
    saveMedicine({ id: formThuoc.id, name: formThuoc.name.trim(), unit: formThuoc.unit.trim() || 'hộp', price: Number(formThuoc.price) || 20000 })
    setFormThuoc(null)
  }

  return (
    <>
      <PageTitle title="Danh mục" sub="Quản lý danh mục chuyên khoa, bác sĩ, dịch vụ khám và bảng giá thuốc." />

      {formBacSi && (
        <Card className="flex flex-wrap items-end gap-3.5 border-2 border-brand p-5">
          <label className="flex flex-[1_1_200px] flex-col gap-1.5 text-sm font-semibold">
            Tên bác sĩ
            <input value={formBacSi.name} onChange={(e) => setFormBacSi({ ...formBacSi, name: e.target.value })} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>
          <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-sm font-semibold">
            Chuyên khoa
            <select value={formBacSi.specialty} onChange={(e) => setFormBacSi({ ...formBacSi, specialty: e.target.value })} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3 text-sm font-normal">
              {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-[1_1_140px] flex-col gap-1.5 text-sm font-semibold">
            Giá khám (đ)
            <input type="number" value={formBacSi.price} onChange={(e) => setFormBacSi({ ...formBacSi, price: e.target.value })} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>
          <Btn size="sm" onClick={luuBacSi}>Lưu bác sĩ</Btn>
          <Btn size="sm" variant="ghost" onClick={() => setFormBacSi(null)}>Đóng</Btn>
        </Card>
      )}

      {formThuoc && (
        <Card className="flex flex-wrap items-end gap-3.5 border-2 border-brand p-5">
          <label className="flex flex-[1_1_200px] flex-col gap-1.5 text-sm font-semibold">
            Tên thuốc
            <input value={formThuoc.name} onChange={(e) => setFormThuoc({ ...formThuoc, name: e.target.value })} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>
          <label className="flex flex-[1_1_120px] flex-col gap-1.5 text-sm font-semibold">
            Đơn vị
            <input value={formThuoc.unit} onChange={(e) => setFormThuoc({ ...formThuoc, unit: e.target.value })} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>
          <label className="flex flex-[1_1_140px] flex-col gap-1.5 text-sm font-semibold">
            Đơn giá (đ)
            <input type="number" value={formThuoc.price} onChange={(e) => setFormThuoc({ ...formThuoc, price: e.target.value })} className="min-h-11 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-sm font-normal" />
          </label>
          <Btn size="sm" onClick={luuThuoc}>Lưu thuốc</Btn>
          <Btn size="sm" variant="ghost" onClick={() => setFormThuoc(null)}>Đóng</Btn>
        </Card>
      )}

      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 flex-[1_1_380px] flex-col gap-3 p-[22px]">
          <div className="flex items-center justify-between">
            <div className="text-[17px] font-bold">Bác sĩ và giá khám</div>
            <Btn size="sm" onClick={() => setFormBacSi({ name: '', specialty: specialties[0], price: '50000' })}>
              + Thêm bác sĩ
            </Btn>
          </div>
          {doctorsList.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-soft px-3.5 py-3 text-[14.5px]">
              <div>
                <b>{d.name}</b>
                <div className="text-[13px] text-muted">{d.specialty}</div>
              </div>
              <div className="flex items-center gap-3">
                <b>{money(d.price)}</b>
                <button
                  type="button"
                  onClick={() => setFormBacSi({ id: d.id, name: d.name, specialty: d.specialty, price: String(d.price) })}
                  className="cursor-pointer rounded-md border border-[#cfe2df] bg-white px-3 py-1 text-xs font-bold text-brand hover:bg-brand-soft"
                >
                  Sửa
                </button>
              </div>
            </div>
          ))}
          <div className="text-[13px] text-muted">Chuyên khoa: {specialties.join(', ')}</div>
        </Card>

        <Card className="flex min-w-0 flex-[1_1_380px] flex-col gap-3 p-[22px]">
          <div className="flex items-center justify-between">
            <div className="text-[17px] font-bold">Thuốc và giá</div>
            <Btn size="sm" onClick={() => setFormThuoc({ name: '', unit: 'hộp', price: '25000' })}>
              + Thêm thuốc
            </Btn>
          </div>
          {medicinesList.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-soft px-3.5 py-3 text-[14.5px]">
              <div>
                <b>{m.name}</b>
                <div className="text-[13px] text-muted">Đơn vị: {m.unit}</div>
              </div>
              <div className="flex items-center gap-3">
                <b>{money(m.price)}</b>
                <button
                  type="button"
                  onClick={() => setFormThuoc({ id: m.id, name: m.name, unit: m.unit, price: String(m.price) })}
                  className="cursor-pointer rounded-md border border-[#cfe2df] bg-white px-3 py-1 text-xs font-bold text-brand hover:bg-brand-soft"
                >
                  Sửa
                </button>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <SampleNote />
    </>
  )
}
