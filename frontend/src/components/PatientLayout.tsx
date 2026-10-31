import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useClinic } from '../store/useClinic'
import { initialOf } from '../utils'
import Icon, { type IconName } from './Icon'

const items: { to: string; icon: IconName; label: string; end?: boolean }[] = [
  { to: '/benh-nhan', icon: 'home', label: 'Trang chủ', end: true },
  { to: '/benh-nhan/dat-lich', icon: 'cal', label: 'Đặt lịch' },
  { to: '/benh-nhan/lich-cua-toi', icon: 'list', label: 'Lịch của tôi' },
]

export default function PatientLayout() {
  const { user, logout } = useClinic()
  const navigate = useNavigate()
  if (!user) return null
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center gap-[18px] bg-white px-10 py-3.5 shadow-[0_1px_0_#e1ecea]">
        <Link to="/benh-nhan" className="flex items-center gap-[11px] text-ink no-underline">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
            <Icon name="plus" size={24} strokeWidth={2.8} />
          </div>
          <div className="text-lg font-bold">Phòng khám đa khoa</div>
        </Link>
        <nav className="ml-3 flex flex-wrap gap-1.5">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] no-underline ${isActive ? 'bg-deep font-semibold text-white' : 'font-medium text-[#33504e] hover:bg-brand-soft'
                }`
              }
            >
              <Icon name={it.icon} size={19} />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3.5">
          <div className="relative flex size-11 items-center justify-center rounded-[13px] bg-page text-[#33504e]">
            <Icon name="bell" size={21} />
            <span className="absolute right-[11px] top-2.5 size-[9px] rounded-full border-2 border-page bg-[#e5533d]" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-[42px] items-center justify-center rounded-full bg-deep font-bold text-mint">
              {initialOf(user.name)}
            </div>
            <div className="text-sm">
              <div className="font-semibold">{user.name}</div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/dang-nhap')
                }}
                className="cursor-pointer border-0 bg-transparent p-0 text-[12.5px] text-muted hover:text-ink"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-6 px-10 pb-11 pt-7">
        <Outlet />
      </main>
    </div>
  )
}