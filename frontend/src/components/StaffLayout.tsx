import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useClinic } from '../store/useClinic'
import { TODAY } from '../data/mock'
import { initialOf } from '../utils'
import Icon, { type IconName } from './Icon'
import type { Role } from '../types'

interface NavItem { to: string; icon: IconName; label: string; end?: boolean }

const roleLabel: Record<Role, string> = {
  patient: 'Bệnh nhân',
  receptionist: 'Lễ tân',
  doctor: 'Bác sĩ',
  pharmacist: 'Dược sĩ',
  cashier: 'Thu ngân',
  admin: 'Quản trị viên',
}

const nav: Partial<Record<Role, NavItem[]>> = {
  receptionist: [
    { to: '/le-tan', icon: 'grid', label: 'Lịch khám hôm nay', end: true },
    { to: '/le-tan/ho-so', icon: 'users', label: 'Hồ sơ bệnh nhân' },
  ],
  doctor: [
    { to: '/bac-si', icon: 'steth', label: 'Khám bệnh', end: true },
    { to: '/bac-si/da-kham', icon: 'folder', label: 'Đã khám hôm nay' },
  ],
  pharmacist: [
    { to: '/duoc-si', icon: 'pill', label: 'Đơn chờ xử lý', end: true },
    { to: '/duoc-si/da-giao', icon: 'check', label: 'Đơn đã giao' },
  ],
  cashier: [
    { to: '/thu-ngan', icon: 'receipt', label: 'Hóa đơn chờ thu', end: true },
    { to: '/thu-ngan/da-thu', icon: 'check', label: 'Hóa đơn đã thu' },
  ],
  admin: [
    { to: '/quan-tri', icon: 'chart', label: 'Thống kê, báo cáo', end: true },
    { to: '/quan-tri/tai-khoan', icon: 'shield', label: 'Tài khoản và phân quyền' },
    { to: '/quan-tri/danh-muc', icon: 'folder', label: 'Danh mục' },
  ],
}

export default function StaffLayout() {
  const { user, logout } = useClinic()
  const navigate = useNavigate()
  if (!user) return null
  const items = nav[user.role] ?? []

  return (
    <div className="flex min-h-screen flex-wrap items-stretch">
      <aside className="flex flex-[0_0_252px] flex-col gap-[26px] bg-deep p-4 pt-[22px] text-white">
        <div className="flex items-center gap-3 px-1.5">
          <div className="flex size-[42px] items-center justify-center rounded-[13px] bg-mint text-deep">
            <Icon name="plus" size={24} strokeWidth={2.8} />
          </div>
          <div>
            <div className="text-[17px] font-bold">Phòng khám</div>
            <div className="text-[13px] text-[#8fbdb8]">{roleLabel[user.role]}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] no-underline ${isActive
                  ? 'bg-brand font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,.22)]'
                  : 'font-medium text-[#b5d6d2] hover:bg-deep-2 hover:text-white'
                }`
              }
            >
              <Icon name={it.icon} size={21} />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="flex size-10 items-center justify-center rounded-full bg-mint font-bold text-deep">
              {initialOf(user.name)}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <div className="truncate font-semibold">{user.name}</div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/dang-nhap')
                }}
                className="mt-0.5 flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[12.5px] text-[#8fbdb8] hover:text-white"
              >
                <Icon name="logout" size={15} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-[999_1_560px] flex-col">
        <header className="flex items-center justify-end gap-3.5 px-8 py-[18px]">
          <div className="rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium shadow-[0_1px_2px_rgba(16,60,56,.05)]">
            {TODAY}
          </div>
          <div className="relative flex size-[46px] items-center justify-center rounded-[14px] bg-white text-[#33504e] shadow-[0_1px_2px_rgba(16,60,56,.05)]">
            <Icon name="bell" size={22} />
            <span className="absolute right-3 top-[11px] size-[9px] rounded-full border-2 border-white bg-[#e5533d]" />
          </div>
        </header>
        <main className="flex flex-col gap-[22px] px-8 pb-9 pt-1.5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}