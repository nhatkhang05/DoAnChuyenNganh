import { useState } from 'react'
import { Btn, Card, Chip, Empty, PageTitle, SampleNote, Tag } from '../../components/ui'
import { useClinic } from '../../store/useClinic'
import { findDoctor, money } from '../../utils'

const methods = ['Tiền mặt', 'Chuyển khoản', 'Quẹt thẻ']

export default function Invoices({ mode }: { mode: 'pending' | 'paid' }) {
  const { invoices, appointments, prescriptions, payInvoice } = useClinic()
  const [selId, setSelId] = useState<number | null>(null)
  const [method, setMethod] = useState(methods[0])

  const list = invoices.filter((i) => (mode === 'pending' ? !i.paid : i.paid))
  const cur = list.find((i) => i.id === selId) ?? list[0]
  const apptOf = (id: number) => appointments.find((a) => a.id === id)
  const hasRx = (apptId: number) => prescriptions.some((p) => p.appointmentId === apptId)
  const totalOf = (i: { visitFee: number; drugFee: number | null }) => i.visitFee + (i.drugFee ?? 0)

  return (
    <>
      <PageTitle
        title={mode === 'pending' ? 'Hóa đơn chờ thu' : 'Hóa đơn đã thu'}
        sub={mode === 'pending' ? 'Tổng tiền = tiền khám + tiền thuốc. Thu xong thì ghi nhận để dược sĩ giao thuốc.' : 'Các hóa đơn đã ghi nhận thanh toán.'}
      />
      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 max-w-[320px] flex-[1_1_250px] flex-col gap-2.5 p-[18px]">
          <div className="text-base font-bold">Danh sách hóa đơn</div>
          {list.length === 0 && <Empty>{mode === 'pending' ? 'Chưa có hóa đơn nào. Bác sĩ cần khám xong bệnh nhân trước.' : 'Chưa thu hóa đơn nào.'}</Empty>}
          {list.map((i) => {
            const a = apptOf(i.appointmentId)
            return (
              <button key={i.id} type="button" onClick={() => setSelId(i.id)} className={`flex cursor-pointer flex-col gap-1.5 rounded-[14px] border p-3.5 text-left ${cur?.id === i.id ? 'border-[#9fd6cd] bg-[#e8f6f3]' : 'border-line bg-white'}`}>
                <div className="flex items-center justify-between gap-2"><b>{a?.patientName}</b><Tag tone={i.paid ? 'ok' : i.drugFee === null ? 'gray' : 'wait'}>{i.paid ? 'Đã thu' : i.drugFee === null ? 'Chờ tính thuốc' : 'Chưa thu'}</Tag></div>
                <div className="text-[13px] text-muted">Số thứ tự {a?.queueNo} · {i.drugFee === null ? money(i.visitFee) + ' + thuốc' : money(totalOf(i))}{i.drugFee === 0 ? ' (không có thuốc)' : ''}</div>
              </button>
            )
          })}
        </Card>

        {cur && (
          <Card className="flex min-w-0 flex-[3_1_480px] flex-col gap-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <div className="text-[21px] font-extrabold">Hóa đơn của {apptOf(cur.appointmentId)?.patientName}</div>
                <div className="text-[14.5px] text-muted">Khám ngày {apptOf(cur.appointmentId)?.date} · {findDoctor(apptOf(cur.appointmentId)?.doctorId ?? 0)?.name}</div>
              </div>
              <Tag tone={cur.paid ? 'ok' : 'wait'} className="!px-3.5 !py-[7px] !text-sm">{cur.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
            </div>
            <table className="w-full border-collapse text-[14.5px]">
              <thead>
                <tr className="bg-soft text-left text-[12.5px] text-muted"><th className="rounded-l-[10px] px-3 py-2.5">Khoản mục</th><th className="rounded-r-[10px] px-3 py-2.5 text-right">Thành tiền</th></tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#edf3f2]"><td className="px-3 py-3.5">Tiền khám</td><td className="px-3 py-3.5 text-right">{money(cur.visitFee)}</td></tr>
                <tr className="border-b border-[#edf3f2]">
                  <td className="px-3 py-3.5">{hasRx(cur.appointmentId) ? 'Tiền thuốc (dược sĩ đã tính)' : 'Tiền thuốc (không kê thuốc)'}</td>
                  <td className="px-3 py-3.5 text-right">{cur.drugFee === null ? 'Chờ dược sĩ tính' : money(cur.drugFee)}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-center justify-between gap-3.5 rounded-2xl bg-deep px-5 py-[18px] text-white">
              <span className="text-[15px] text-[#a9d3ce]">Tổng tiền cần thu</span>
              <span className="text-[32px] font-extrabold">{cur.drugFee === null ? '—' : money(totalOf(cur))}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold">Hình thức thu tại quầy</div>
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => <Chip key={m} dark={false} active={(cur.paid ? cur.method : method) === m} onClick={() => !cur.paid && setMethod(m)}>{m}</Chip>)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1.5">
              <Btn disabled={cur.paid || cur.drugFee === null} onClick={() => payInvoice(cur.id, method)}>{cur.paid ? 'Đã ghi nhận thanh toán' : 'Ghi nhận đã thanh toán'}</Btn>
              <div className="min-w-[220px] flex-1 text-sm text-muted">
                {cur.paid
                  ? hasRx(cur.appointmentId) ? 'Đã báo cho dược sĩ: có thể giao thuốc.' : 'Hoàn tất. Không có thuốc nên bệnh nhân có thể ra về.'
                  : cur.drugFee === null ? 'Chờ dược sĩ nhập đơn và tính tiền thuốc rồi mới thu được.' : 'Bấm sau khi bệnh nhân đã đóng đủ tiền.'}
              </div>
            </div>
          </Card>
        )}
      </div>
      <SampleNote />
    </>
  )
}
