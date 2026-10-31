import { useNavigate } from 'react-router-dom'
import { doctors } from '../data/mock'
import { useClinic } from '../store/useClinic'
import { homeOf } from '../utils'
import type { Account, Role } from '../types'

const roleLabel: Record<Role, string> = {
  patient: 'Bệnh nhân',
  receptionist: 'Lễ tân',
  doctor: 'Bác sĩ',
  pharmacist: 'Dược sĩ',
  cashier: 'Thu ngân',
  admin: 'Quản trị',
}
const roleOrder: Role[] = ['patient', 'receptionist', 'doctor', 'pharmacist', 'cashier', 'admin']

// Tên hiển thị trong ô chọn. Bác sĩ thì ghi thêm chuyên khoa để phân biệt.
function optionLabel(acc: Account) {
  if (acc.role !== 'doctor') return roleLabel[acc.role]
  const d = doctors.find((x) => x.name.includes(acc.name))
  return `Bác sĩ ${d?.specialty ?? ''} (${acc.name})`
}

// Chỉ để demo: đổi nhanh vai trò mà không cần đăng xuất rồi đăng nhập lại.
// Mỗi vai trò lấy 1 tài khoản đầu tiên chưa khóa; riêng bác sĩ thì liệt kê từng người.
export default function RoleSwitcher({ dark = false }: { dark?: boolean }) {
  const { user, accounts, loginAs } = useClinic()
  const navigate = useNavigate()

  const options = roleOrder.flatMap((role) => {
    const list = accounts.filter((a) => a.role === role && !a.locked)
    return role === 'doctor' ? list : list.slice(0, 1)
  })

  return (
    <label className={`flex flex-col gap-1 text-[12.5px] ${dark ? 'text-[#b5d6d2]' : 'text-muted'}`}>
      Đổi nhanh vai trò (demo)
      <select
        value={user?.id}
        onChange={(e) => {
          const acc = options.find((a) => a.id === Number(e.target.value))
          if (!acc) return
          loginAs(acc.role, acc.id)
          navigate(homeOf(acc.role))
        }}
        className="min-h-10 cursor-pointer rounded-[10px] border border-[#cfe2df] bg-white px-2.5 text-sm font-medium text-ink"
      >
        {options.map((a) => (
          <option key={a.id} value={a.id}>{optionLabel(a)}</option>
        ))}
      </select>
    </label>
  )
}
