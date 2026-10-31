import { useState } from 'react'
import Icon from '../../components/Icon'
import { Avatar, Btn, Card, Chip, PageTitle, SampleNote, Tag } from '../../components/ui'
import { permissions } from '../../data/mock'
import { useClinic } from '../../store/useClinic'
import { initialOf } from '../../utils'
import type { Role } from '../../types'

const roleName: Record<Role, string> = { patient: 'Bệnh nhân', receptionist: 'Lễ tân', doctor: 'Bác sĩ', pharmacist: 'Dược sĩ', cashier: 'Thu ngân', admin: 'Quản trị viên' }
const roleKeys = Object.keys(roleName) as Role[]

export default function Accounts() {
  const { accounts, toggleLock, createAccount } = useClinic()
  const [role, setRole] = useState<Role>('pharmacist')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [newRole, setNewRole] = useState<Role>('receptionist')

  const submit = () => {
    if (!name.trim() || !username.trim()) return
    createAccount(name.trim(), username.trim(), newRole)
    setName(''); setUsername(''); setShowForm(false)
  }

  return (
    <>
      <PageTitle title="Tài khoản và phân quyền" sub="Mỗi tài khoản thuộc một vai trò. Vai trò quyết định chức năng nào được dùng.">
        <Btn onClick={() => setShowForm((v) => !v)}><Icon name="plus" size={19} strokeWidth={2.6} /> Tạo tài khoản nhân viên</Btn>
      </PageTitle>

      {showForm && (
        <Card className="flex flex-wrap items-end gap-3.5 p-5">
          <label className="flex flex-[1_1_200px] flex-col gap-1.5 text-sm font-semibold">Họ tên
            <input value={name} onChange={(e) => setName(e.target.value)} className="min-h-12 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[15px] font-normal" />
          </label>
          <label className="flex flex-[1_1_180px] flex-col gap-1.5 text-sm font-semibold">Tên đăng nhập
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="min-h-12 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[15px] font-normal" />
          </label>
          <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-sm font-semibold">Vai trò
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className="min-h-12 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3 text-[15px] font-normal">
              {roleKeys.filter((r) => r !== 'patient').map((r) => <option key={r} value={r}>{roleName[r]}</option>)}
            </select>
          </label>
          <Btn disabled={!name.trim() || !username.trim()} onClick={submit}>Tạo (mật khẩu mặc định 123456)</Btn>
        </Card>
      )}

      <div className="flex flex-wrap items-start gap-[22px]">
        <Card className="flex min-w-0 flex-[3_1_440px] flex-col gap-3 p-[22px]">
          <div className="text-[17px] font-bold">Danh sách tài khoản</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14.5px]">
              <thead>
                <tr className="bg-soft text-left text-[12.5px] text-muted">
                  <th className="rounded-l-[10px] px-3 py-2.5">Họ tên</th><th className="px-3 py-2.5">Tên đăng nhập</th><th className="px-3 py-2.5">Vai trò</th><th className="px-3 py-2.5">Trạng thái</th><th className="rounded-r-[10px] px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-[#edf3f2]">
                    <td className="px-3 py-3"><div className="flex items-center gap-2.5"><Avatar letter={initialOf(a.name)} size={36} /><b>{a.name}</b></div></td>
                    <td className="px-3 py-3">{a.username}</td>
                    <td className="px-3 py-3">{roleName[a.role]}</td>
                    <td className="px-3 py-3"><Tag tone={a.locked ? 'gray' : 'ok'}>{a.locked ? 'Đã khóa' : 'Đang hoạt động'}</Tag></td>
                    <td className="px-3 py-3 text-right">
                      {a.role !== 'admin' && <Btn size="sm" variant={a.locked ? 'light' : 'danger'} onClick={() => toggleLock(a.id)}>{a.locked ? 'Mở khóa' : 'Khóa'}</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex min-w-0 flex-[2_1_320px] flex-col gap-3.5 p-[22px]">
          <div className="text-[17px] font-bold">Quyền của từng vai trò</div>
          <div className="flex flex-wrap gap-2">
            {roleKeys.map((r) => <Chip key={r} dark={false} active={role === r} onClick={() => setRole(r)}>{roleName[r]}</Chip>)}
          </div>
          <div className="flex flex-col gap-1.5">
            {permissions[role].map((p) => (
              <div key={p} className="flex items-center gap-3 rounded-xl bg-soft px-3 py-[11px] text-[14.5px]">
                <div className="flex size-6 flex-none items-center justify-center rounded-full bg-brand text-white"><Icon name="check" size={14} strokeWidth={3.2} /></div>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <SampleNote />
    </>
  )
}
