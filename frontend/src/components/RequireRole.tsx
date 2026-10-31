import { Navigate, Outlet } from 'react-router-dom'
import { useClinic } from '../store/useClinic'
import { homeOf } from '../utils'
import type { Role } from '../types'

// Chặn vào trang nếu chưa đăng nhập hoặc sai vai trò (giống Guards bên NestJS sau này).
export default function RequireRole({ role }: { role: Role }) {
  const { user } = useClinic()
  if (!user) return <Navigate to="/dang-nhap" replace />
  if (user.role !== role) return <Navigate to={homeOf(user.role)} replace />
  return <Outlet />
}
