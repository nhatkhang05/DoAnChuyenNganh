import { doctors } from '../data/mock'
import { useClinic } from './useClinic'

// Tìm bác sĩ ứng với tài khoản đang đăng nhập (theo tên)
export function useMyDoctor() {
  const { user } = useClinic()
  return doctors.find((d) => user && d.name.includes(user.name)) ?? doctors[0]
}
